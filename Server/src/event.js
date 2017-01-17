import {
    OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
    CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, setIssueRes
} from './utils';
import Router from 'koa-router';
import {getLogger} from './utils';
import {getUsername, getUsernameFromCtx} from './auth';

const log = getLogger('event');

let gEventsLastUpdateDate = null;

export class EventRouter extends Router
{
    constructor(props)
    {
        super(props);
        this.eventStore = props.eventStore;
        this.io = props.io;
        
        this
            // GET ALL
            .get('/', async(ctx) =>
            {
                getUsernameFromCtx(ctx);

                let res = ctx.response;
                let lastModified = ctx.request.get(LAST_MODIFIED);
                if (lastModified && gEventsLastUpdateDate && gEventsLastUpdateDate <= new Date(lastModified).getTime())
                {
                    log('search / - 304 Not Modified (the client can use the cached data)');
                    res.status = NOT_MODIFIED;
                }
                else
                {
                    res.body = this.setCanEditField(await this.eventStore.find({}), ctx);
                    
                    if (!gEventsLastUpdateDate)
                    {
                        gEventsLastUpdateDate = Date.now();
                    }
                    res.set({[LAST_MODIFIED]: new Date(gEventsLastUpdateDate)});
                    log('search / - 200 Ok');
                }
            })
            
            // GET BY ID
            .get('/:id', async(ctx) =>
            {
                let event = await this.eventStore.findOne({_id: ctx.params.id});
                let res = ctx.response;
                if (event)
                {
                    log('read /:id - 200 Ok');
                    this.setEventRes(res, OK, event); //200 Ok
                }
                else
                {
                    log('read /:id - 404 Not Found (if you know the resource was deleted, then you can return 410 Gone)');
                    setIssueRes(res, NOT_FOUND, [{warning: 'Event not found'}]);
                }
            })

            // ATTEND
            .post('/attend', async(ctx) =>
            {
                let eventId = ctx.request.body.eventId;
                let res = ctx.response;
                
                if (!eventId) 
                {
                    log(`attend / - 400 Bad Request`);
                    setIssueRes(res, BAD_REQUEST, {error: 'Event is invalid. Please check again.', 'attend': 0});
                    return;
                }

                let event = await this.eventStore.findOne({_id: eventId});
                if (!event)
                {
                    log(`attend ${eventId} - 404 Not Found`);
                    setIssueRes(res, NOT_FOUND, [{'error': 'Event not found', 'attend': 0}]);
                    return;
                }
                
                if (event.attend >= event.maxCap)
                {
                    log(`attend ${eventId} - 400 Bad Request`);
                    setIssueRes(res, NOT_FOUND, [{'error': 'Maximum capacity was reached.', 'attend': event.attend}]);
                    return;
                }
                
                event.attend += 1;
                event.updated = Date.now();

                let updatedCount = await this.eventStore.update({_id: eventId}, event);
                if (updatedCount == 1)
                {
                    log(`attend ${eventId} OK`);
                    this.setEventRes(res, OK, {'attend': event.attend}); //200 Ok
                    this.io.emit('event-updated', event);
                    gEventsLastUpdateDate = event.updated;
                }
                else
                {
                    log(`attend ${eventId} - 404 Not Found`);
                    setIssueRes(res, NOT_FOUND, [{'error': 'Event no longer exists', 'attend': 0}]);
                }
            })

            // ADD
            .post('/', async(ctx) =>
            {
                let event = ctx.request.body;
                let res = ctx.response;
    
                //validation
                let err = this.isEventValid(event);
                if (!err)
                {
                    await this.createEvent(res, event);
                }
                else
                {
                    log(`create / - 400 Bad Request`);
                    setIssueRes(res, BAD_REQUEST, [{error: err}]);
                }
            })
            
            // UPDATE
            .put('/:id', async(ctx) =>
            {
                let event = ctx.request.body;
                let id = ctx.params.id;
                let eventId = event._id;
                let res = ctx.response;
                
                if (eventId && eventId != id)
                {
                    log(`update /:id - 400 Bad Request (param id and body _id should be the same)`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]);
                    return;
                }
                
                if (getUsernameFromCtx(ctx) != event.orgName)
                {
                    log(`update /:id - 400 Bad Request (Not the same username)`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Username not matching'}]);
                    return;
                }
                
                // validare
                let err = this.isEventValid(event);
                if (err)
                {
                    log(`update /:id - 400 Bad Request (validation errors)`);
                    setIssueRes(res, BAD_REQUEST, [{error: err}]);
                    return;
                }
                
                if (!eventId)
                {
                    await this.createEvent(res, event);
                }
                else
                {
                    let persistedEvent = await this.eventStore.findOne({_id: id, orgName: event.orgName});
                    if (persistedEvent)
                    {
                        event.updated = Date.now();
                        
                        let updatedCount = await this.eventStore.update({_id: id, orgName: event.orgName}, event);
                        gEventsLastUpdateDate = event.updated;
                        
                        if (updatedCount == 1)
                        {
                            this.setEventRes(res, OK, event); //200 Ok
                            this.io.emit('event-updated', event);
                        }
                        else
                        {
                            log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                            setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Event no longer exists'}]); //
                        }
                    }
                    else
                    {
                        log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                        setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Event no longer exists'}]); //Method Not Allowed
                    }
                }
            })
            
            // DELETE
            .del('/:id', async(ctx) =>
            {
                let id = ctx.params.id;
                let x = await this.eventStore.remove({_id: id});
                log(`DELETE ${id} RETURNED: ${x}`);
                this.io.emit('event-deleted', {_id: id});
                
                gEventsLastUpdateDate = Date.now();
                ctx.response.status = NO_CONTENT;
                ctx.response.body = ctx.body;
                log(`remove /:id - 204 No content (even if the resource was already deleted), or 200 Ok`);
            });
    }

    isEventValid(e) 
    {
        if (!e) return "Invalid event";

        var err = "";
        if (!e.name) err += "\nEmpty name";
        if (!e.date) err += "\nEmpty date";
        if (!e.minAge || isNaN(parseInt(e.minAge)) || parseInt(e.minAge) < 0) err += "\nInvalid Age";
        if (!e.city) err += "\nEmpty City";
        if (!e.address) err += "\nEmpty Address";
        if (!e.attend || isNaN(parseInt(e.attend)) || parseInt(e.attend) < 0) err += "\nInvalid number of attendees";
        if (!e.maxCap || isNaN(parseInt(e.maxCap)) || parseInt(e.maxCap) < 0) err += "\nInvalid capacity";
        if (parseInt(e.attend) > parseInt(e.maxCap)) err += "\nCapacity is too small";
        
        return err;
    }
    

    setCanEditField(lst, ctx)
    {
        let user = getUsernameFromCtx(ctx);
        
        for (let i = 0; i < lst.length; i++)
        {
            let u = lst[i];
            
            if (u.orgName === user)
            {
                u.canEdit = true;
            }
        }
        
        return lst;
    }
    
    async createEvent(res, event)
    {
        event.version = 1;
        event.updated = Date.now();
        
        let insertedEvent = await this.eventStore.insert(event);
        
        gEventsLastUpdateDate = event.updated;
        this.setEventRes(res, CREATED, insertedEvent); //201 Created
        this.io.emit('event-created', insertedEvent);
    }
    
    setEventRes(res, status, event)
    {
        res.body = event;
        res.set({
            [ETAG]: event.version,
            [LAST_MODIFIED]: new Date(event.updated)
        });
        res.status = status; //200 Ok or 201 Created
    }
}
