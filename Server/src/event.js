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
            
            .post('/', async(ctx) =>
            {
                let event = ctx.request.body;
                let res = ctx.response;
    
                //validation
                if (event.name && event.date)
                {
                    await this.createEvent(res, event);
                }
                else
                {
                    log(`create / - 400 Bad Request`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Event is invalid. Please check again.'}]);
                }
            })
            
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
                
                // validare
                if (!event.name)
                {
                    log(`update /:id - 400 Bad Request (validation errors)`);
                    setIssueRes(res, BAD_REQUEST, [{error: 'Name is missing'}]);
                    return;
                }
                
                if (!eventId)
                {
                    await this.createEvent(res, event);
                }
                else
                {
                    let persistedEvent = await this.eventStore.findOne({_id: id});
                    
                    if (persistedEvent)
                    {
                        let eventVersion = parseInt(ctx.request.get(ETAG)) || event.version;
                        if (!eventVersion)
                        {
                            log(`update /:id - 400 Bad Request (no version specified)`);
                            setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
                        }
                        else if (eventVersion  < persistedEvent.version)
                        {
                            log(`update /:id - 409 Conflict`);
                            setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
                        }
                        else
                        {
                            event.version = eventVersion + 1;
                            event.updated = Date.now();
                            
                            let updatedCount = await this.eventStore.update({_id: id}, event);
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
                    }
                    else
                    {
                        log(`update /:id - 405 Method Not Allowed (resource no longer exists)`);
                        setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Event no longer exists'}]); //Method Not Allowed
                    }
                }
            })
            
            .del('/:id', async(ctx) =>
            {
                let id = ctx.params.id;
                await this.eventStore.remove({_id: id});
                this.io.emit('event-deleted', {_id: id});
                
                gEventsLastUpdateDate = Date.now();
                ctx.response.status = NO_CONTENT;
                
                log(`remove /:id - 204 No content (even if the resource was already deleted), or 200 Ok`);
            });
    }
    
    __List(x)
    {
        log('---------------------------------------------------');
        for (let p in x)
        {
            log(`${p} :--: ${x[p]}`);
        }
    }
    
    setCanEditField(lst, ctx)
    {
        let user = getUsernameFromCtx(ctx);
        
        for (let i = 0; i < lst.length; i++)
        {
            let u = lst[i];
            
            if (u.orgName === user)
            {
                log('da');
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


//
// // vars
// let gEventsLastUpdateDate = null;
//
//
//
// const EVENT = '/Event';
//
// router
//     // GetAll
//     .get(EVENT, async(ctx) =>
//     {
//         let res = ctx.response;
//         let lastModified = ctx.request.get(LAST_MODIFIED);
//         if (lastModified && gEventsLastUpdateDate && gEventsLastUpdateDate <= new Date(lastModified).getTime())
//         {
//             res.status = NOT_MODIFIED; //304 Not Modified (the client can use the cached data)
//         }
//         else
//         {
//             res.body = await eventStore.find({});
//             if (!gEventsLastUpdateDate)
//             {
//                 gEventsLastUpdateDate = Date.now();
//             }
//             res.set({[LAST_MODIFIED]: new Date(gEventsLastUpdateDate)});
//         }
//     })
//
//     // GetAllByID
//     .get([EVENT, ':id'].join('/'), async(ctx) =>
//     {
//         let event = await eventStore.findOne({_id: ctx.params.id});
//         let res = ctx.response;
//         if (event)
//         {
//             setEventRes(res, OK, event); //200 Ok
//         }
//         else
//         {
//             setIssueRes(res, NOT_FOUND, [{warning: 'Event not found'}]); //404 Not Found (if you know the resource was deleted, then return 410 Gone)
//         }
//     })
//
//     // CreateEvent ????????????????????????????
//     .post(EVENT, async(ctx) =>
//     {
//         let event = ctx.request.body;
//         let res = ctx.response;
//         if (event.text)
//         { //validation
//             await createEvent(res, event);
//         }
//         else
//         {
//             setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]); //400 Bad Request
//         }
//     })
//     // .put([NOTE, ':id'].join('/'), async(ctx) =>
//     // {
//     //     let note = ctx.request.body;
//     //     let id = ctx.params.id;
//     //     let noteId = note._id;
//     //     let res = ctx.response;
//     //     if (noteId && noteId != id)
//     //     {
//     //         setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]); //400 Bad Request
//     //         return;
//     //     }
//     //     if (!note.text)
//     //     {
//     //         setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]); //400 Bad Request
//     //         return;
//     //     }
//     //     if (!noteId)
//     //     {
//     //         await createNote(res, note);
//     //     }
//     //     else
//     //     {
//     //         let persistedNote = await eventStore.findOne({_id: id});
//     //         if (persistedNote)
//     //         {
//     //             let noteVersion = parseInt(ctx.request.get(ETAG)) || note.version;
//     //             if (!noteVersion)
//     //             {
//     //                 setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
//     //             }
//     //             else if (noteVersion < persistedNote.version)
//     //             {
//     //                 setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
//     //             }
//     //             else
//     //             {
//     //                 note.version = noteVersion + 1;
//     //                 note.updated = Date.now();
//     //                 let updatedCount = await eventStore.update({_id: id}, note);
//     //                 notesLastUpdate = note.updated;
//     //                 if (updatedCount == 1)
//     //                 {
//     //                     setNoteRes(res, OK, note); //200 Ok
//     //                     io.emit('note-updated', note);
//     //                 }
//     //                 else
//     //                 {
//     //                     setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Note no longer exists'}]); //405 Method Not Allowed
//     //                 }
//     //             }
//     //         }
//     //         else
//     //         {
//     //             setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Note no longer exists'}]); //Method Not Allowed
//     //         }
//     //     }
//     // })
//     // .del([NOTE, ':id'].join('/'), async(ctx) =>
//     // {
//     //     let id = ctx.params.id;
//     //     await eventStore.remove({_id: id});
//     //     io.emit('note-deleted', {_id: id})
//     //     notesLastUpdate = Date.now();
//     //     ctx.response.status = NO_CONTENT; //204 No content (even if the resource was already deleted), or 200 Ok
//     // })
// ;
//
// const createEvent = async(res, event) =>
// {
//     // note.version = 1;
//     // note.updated = Date.now();
//     let insertedEvent = await eventStore.insert(event);
//     gEventsLastUpdateDate = Date.now();
//     setEventRes(res, CREATED, insertedEvent); //201 Created
//     io.emit('event-created', insertedEvent);
// }
//
// const setEventRes = (res, status, event) =>
// {
//     res.body = event;
//     res.set({[ETAG]: event.version, [LAST_MODIFIED]: new Date(event.updated)});
//     res.status = status; //200 Ok or 201 Created
// };
//
// app
//     .use(router.routes())
//     .use(router.allowedMethods());
