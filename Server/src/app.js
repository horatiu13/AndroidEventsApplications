const Koa = require('koa')
    , app = new Koa()
    , server = require('http').createServer(app.callback())
    , io = require('socket.io')(server)
    , cors = require('koa-cors')
    , convert = require('koa-convert')
    , bodyparser = require('koa-bodyparser')
    , router = require('koa-router')()
    , datastore = require('nedb-promise')
    , noteStore = datastore({filename: '../notes.json', autoload: true});

let notesLastUpdate = null;

app.use(async(ctx, next) =>
{ //logger
    const start = new Date();
    await next();
    console.log(`${ctx.method} ${ctx.url} - ${new Date() - start}ms`);
});

app.use(async(ctx, next) =>
{ //error handler
    try
    {
        await next();
    }
    catch (err)
    {
        setIssueRes(ctx.response, 500, [{error: err.message || 'Unexpected error'}]);
    }
});

app.use(bodyparser());
app.use(convert(cors()));

const NOTE = '/Note'
    , LAST_MODIFIED = 'Last-Modified'
    , ETAG = 'ETag'
    , OK = 200
    , CREATED = 201
    , NO_CONTENT = 204
    , NOT_MODIFIED = 304
    , BAD_REQUEST = 400
    , NOT_FOUND = 404
    , METHOD_NOT_ALLOWED = 405
    , CONFLICT = 409;

router
    .get(NOTE, async(ctx) =>
    {
        let res = ctx.response;
        let lastModified = ctx.request.get(LAST_MODIFIED);
        if (lastModified && notesLastUpdate && notesLastUpdate <= new Date(lastModified).getTime())
        {
            res.status = NOT_MODIFIED; //304 Not Modified (the client can use the cached data)
        }
        else
        {
            res.body = await noteStore.find({});
            if (!notesLastUpdate)
            {
                notesLastUpdate = Date.now();
            }
            res.set({[LAST_MODIFIED]: new Date(notesLastUpdate)});
        }
    })
    .get([NOTE, ':id'].join('/'), async(ctx) =>
    {
        let note = await noteStore.findOne({_id: ctx.params.id});
        let res = ctx.response;
        if (note)
        {
            setNoteRes(res, OK, note); //200 Ok
        }
        else
        {
            setIssueRes(res, NOT_FOUND, [{warning: 'Note not found'}]); //404 Not Found (if you know the resource was deleted, then return 410 Gone)
        }
    })
    .post(NOTE, async(ctx) =>
    {
        let note = ctx.request.body;
        let res = ctx.response;
        if (note.text)
        { //validation
            await createNote(res, note);
        }
        else
        {
            setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]); //400 Bad Request
        }
    })
    .put([NOTE, ':id'].join('/'), async(ctx) =>
    {
        let note = ctx.request.body;
        let id = ctx.params.id;
        let noteId = note._id;
        let res = ctx.response;
        if (noteId && noteId != id)
        {
            setIssueRes(res, BAD_REQUEST, [{error: 'Param id and body _id should be the same'}]); //400 Bad Request
            return;
        }
        if (!note.text)
        {
            setIssueRes(res, BAD_REQUEST, [{error: 'Text is missing'}]); //400 Bad Request
            return;
        }
        if (!noteId)
        {
            await createNote(res, note);
        }
        else
        {
            let persistedNote = await noteStore.findOne({_id: id});
            if (persistedNote)
            {
                let noteVersion = parseInt(ctx.request.get(ETAG)) || note.version;
                if (!noteVersion)
                {
                    setIssueRes(res, BAD_REQUEST, [{error: 'No version specified'}]); //400 Bad Request
                }
                else if (noteVersion < persistedNote.version)
                {
                    setIssueRes(res, CONFLICT, [{error: 'Version conflict'}]); //409 Conflict
                }
                else
                {
                    note.version = noteVersion + 1;
                    note.updated = Date.now();
                    let updatedCount = await noteStore.update({_id: id}, note);
                    notesLastUpdate = note.updated;
                    if (updatedCount == 1)
                    {
                        setNoteRes(res, OK, note); //200 Ok
                        io.emit('note-updated', note);
                    }
                    else
                    {
                        setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Note no longer exists'}]); //405 Method Not Allowed
                    }
                }
            }
            else
            {
                setIssueRes(res, METHOD_NOT_ALLOWED, [{error: 'Note no longer exists'}]); //Method Not Allowed
            }
        }
    })
    .del([NOTE, ':id'].join('/'), async(ctx) =>
    {
        let id = ctx.params.id;
        await noteStore.remove({_id: id});
        io.emit('note-deleted', {_id: id})
        notesLastUpdate = Date.now();
        ctx.response.status = NO_CONTENT; //204 No content (even if the resource was already deleted), or 200 Ok
    });

const setIssueRes = (res, status, issue) =>
{
    res.body = {issue: issue};
    res.status = status; //Bad Request
}

const createNote = async(res, note) =>
{
    note.version = 1;
    note.updated = Date.now();
    let insertedNote = await noteStore.insert(note);
    notesLastUpdate = note.updated;
    setNoteRes(res, CREATED, insertedNote); //201 Created
    io.emit('note-created', insertedNote);
}

const setNoteRes = (res, status, note) =>
{
    res.body = note;
    res.set({[ETAG]: note.version, [LAST_MODIFIED]: new Date(note.updated)});
    res.status = status; //200 Ok or 201 Created
}

app
    .use(router.routes())
    .use(router.allowedMethods());

io.on('connection', (socket) =>
{
    console.log('client connected');
    socket.on('disconnect', () =>
    {
        console.log('client disconnected');
    })
});

(async() =>
{
    await noteStore.remove({});
    for (let i = 0; i < 100; i++)
    {
        await noteStore.insert({text: `Note ${i}`, status: "active", updated: Date.now()});
        console.log(`Note ${i} added`);
    }
})();

server.listen(3000);