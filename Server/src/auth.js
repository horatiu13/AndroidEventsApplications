import {
    OK, NOT_FOUND, LAST_MODIFIED, NOT_MODIFIED, BAD_REQUEST, ETAG,
    CONFLICT, METHOD_NOT_ALLOWED, NO_CONTENT, CREATED, setIssueRes,
    getUserToAdd
} from './utils';
import Router from 'koa-router';
import jwt from 'jsonwebtoken';
import {getLogger} from './utils';

const log = getLogger('auth');

export const jwtConfig = {
    secret: 'my-secret'
};

function createToken(user)
{
    let t = jwt.sign(
        {username: user.username, _id: user._id},
        jwtConfig.secret,
        {expiresIn: 60 * 60 * 60}
    );
    
    log(`create token for ${user.username} -- ${t}`);
    
    return t;
}

export function decodeToken(token)
{
    let decoded = jwt.decode(token, jwtConfig.secret);
    log(`decoded token for ${decoded}`);
    return decoded;
}

export function getUsername(token)
{
    let decoded = jwt.decode(token, jwtConfig.secret);
    log(`got username for ${decoded.username}`);
    return decoded.username;
}


export function getUsernameFromCtx(ctx)
{
    let aut = ctx.request.header.authorization;
    if (!aut)
    {
        log(`Invalid ctx format`);
        return null;
    }
    
    let lst = aut.split(' ');
    if (lst.length != 2)
    {
        log(`Invalid ctx format`);
        return null;
    }
    
    return getUsername(lst[1]);
}


function __list(x)
{
    log(x);
    log(`${x}`);
    log('---------------------------------------------------');
    for (let p in x)
    {
        log(`${p} :--: ${x[p]}`);
    }
}

export class AuthRouter extends Router {
    constructor(args)
    {
        super(args);
        this.userStore = args.userStore;
        
        // Inregistrare
        this.post('/signup', async(ctx, next) =>
        {
            log(`signup - user ${JSON.stringify(ctx.request.body)} trying to register`);
            
            let userToAdd = getUserToAdd(ctx.request.body);
            if (!userToAdd)
            {
                setIssueRes(ctx.response, BAD_REQUEST, [{error: `At least one field is empty or invalid`}]);
                log(`signup - user ${JSON.stringify(ctx.request.body)} is invalid`);
                return;
            }
            
            let user = await this.userStore.findOne({username: userToAdd.username}); 
            if (user)
            {
                setIssueRes(ctx.response, CONFLICT, [{error: `User ${user.username} already exists`}]);
                log(`signup - user ${user.username} already exists`);
                return;
            }

            user = await this.userStore.insert(userToAdd);
            ctx.response.body = {token: createToken(user), user: user};
            ctx.status = CREATED;
            log(`signup - user ${user.username} created`);
        });
        
        // LogIn
        this.post('/session', async(ctx, next) =>
        {
            let reqBody = ctx.request.body;
            if (!reqBody.username || !reqBody.password)
            {
                log(`session - missing username and password`);
                setIssueRes(ctx.response, BAD_REQUEST, [{error: 'Both username and password must be set'}]);
                return;
            }
            
            let user = await this.userStore.findOne({username: reqBody.username});
            if (user)
            {
                if (user.password === reqBody.password)
                {
                    ctx.status = CREATED;
                    ctx.response.body = {token: createToken(user), user: user};
                    log(`session - token created`);
                    decodeToken(ctx.response.body.token);
                }
                else
                {
                    log(`session - wrong password`);
                    setIssueRes(ctx.response, BAD_REQUEST, [{error: 'Wrong password'}]);
                }
            }
            else
            {
                log(`session - wrong username`);
                setIssueRes(ctx.response, BAD_REQUEST, [{error: 'Wrong username'}]);
            }
        })
    }
}
