// logger
export function getLogger(tag)
{
    return function(msg)
    {
        console.log(`[${tag}] [` + (new Date()).toDateString() + `] :: ${msg}`);
    }
}

const timingLog = getLogger('utils');

export const timingLogger = async(ctx, next) =>
{
    const start = new Date();
    await next();
    timingLog(`${ctx.method} ${ctx.url} => ${ctx.response.status}, ${new Date() - start}ms`);
};

const issueLog = getLogger('issue logger');


// errors
export const errorHandler = async(ctx, next) =>
{
    try
    {
        await next();
    }
    catch (err)
    {
        issueLog(err);
        setIssueRes(ctx.response, 500, [{error: err.message || 'Unexpected error'}]);
    }
};

export const setIssueRes = (res, status, issue) =>
{
    res.body = {issue: issue};
    res.status = status; //Bad Request
    issueLog(`${res.status}, ${JSON.stringify(res.body)}`)
};


export const isUserValid = (user) =>
{
    return true;
};

export const getUserToAdd = (user) =>
{
    if (!isUserValid(user))
    {
        return null;
    }
    
    return user;
};


// results
export const LAST_MODIFIED = 'Last-Modified';
export const ETAG = 'ETag';
export const OK = 200;
export const CREATED = 201;
export const NO_CONTENT = 204;
export const NOT_MODIFIED = 304;
export const BAD_REQUEST = 400;
export const NOT_FOUND = 404;
export const METHOD_NOT_ALLOWED = 405;
export const CONFLICT = 409;
