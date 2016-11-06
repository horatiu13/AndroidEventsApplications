import {getLogger, timingLogger, errorHandler} from './utils';
import {AuthRouter, jwtConfig} from './auth';
import {EventRouter} from './event';

import Koa from 'koa';
import cors from 'koa-cors';
import convert from 'koa-convert';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import koaJwt from 'koa-jwt';
import http from 'http';
import socketIo from 'socket.io';
import dataStore from 'nedb-promise';


// baza de date
const eventStore = dataStore({filename: 'events.json', autoload: true});
const userStore  = dataStore({filename: 'users.json', autoload: true});

// program
const app = new Koa();
// const router = new Router();
const server = http.createServer(app.callback());
const io = socketIo(server);

// logger
const log = getLogger('app');
app.use(timingLogger);
app.use(errorHandler);
app.use(bodyParser());
app.use(convert(cors()));


// routes
const apiUrl = '/api';

log('Starting to config public routes');
const authApi = new Router({prefix: apiUrl});
authApi.use('/auth', new AuthRouter({userStore, io}).routes());
app.use(authApi.routes()).use(authApi.allowedMethods());

log('Starting to config private routes');
app.use(convert(koaJwt(jwtConfig)));
const protectedApi = new Router({prefix: apiUrl});
protectedApi.use('/event', new EventRouter({eventStore, io}).routes());
app.use(protectedApi.routes()).use(protectedApi.allowedMethods());


// io
io.on('connection', (socket) =>
{
    log('client connected');
    socket.on('disconnect', () =>
    {
        log('client disconnected');
    })
});

// incarcare program (adaugare in baza de date)
(async() =>
{
    log('Am porniiitttttt!!!!!!!');
    log('Starting to add some users...');
    
    let lstPass = ['o', 'org', 'u'];
    let users = await userStore.find({});
    
    if (!users.length)
    {
        for (let i = 0; i < lstPass.length; i++)
        {
            let pass = lstPass[i];
            let user = await userStore.insert({username: pass, password: pass, name: 'Nume ' + pass, mail: pass + '@gmail.com', birthDate: Date.now(), city: 'Cluj ' + i.toString(), isOrg: i < 2 ? 1 : 0});
            log(`org added ${JSON.stringify(user)}`);
        }
    }
    log(`There are at least ${lstPass.length} users in store now`);
    
    let events = await eventStore.find({});
    if (events.length)
    {
        log(`There are already ${events.length} events`)
    }
    else
    {
        for (let i = 0; i < 5; i++)
        {
            let e = await eventStore.insert({name: `Event ${i}`, date: Date.now(), minAge:i, city:`City ${i}`, address: `Adderss ${i}`, maxCap: (i + 1) * 5, orgName: i % 2 ? 'o' : 'org', canEdit: false});
            log(`Event ${JSON.stringify(e)} added`);
        }
    }
    log(`There are 5 users in store now`);
    
})();

server.listen(3000);
