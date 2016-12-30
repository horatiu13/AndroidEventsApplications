import {getLogger} from '../utils/utils';
import {apiUrl, authHeaders} from '../utils/api';

const log = getLogger('event/service');
const action = (type, payload) => ({type, payload});

const SAVE_EVENT_STARTED        = 'event/saveStarted';
const SAVE_EVENT_SUCCEEDED      = 'event/saveSucceeded';
const SAVE_EVENT_FAILED         = 'event/saveFailed';
const SAVE_EVENT_CANCEL         = 'event/saveCancel';

const DEL_EVENT_STARTED         = 'event/delStarted';
const DEL_EVENT_SUCCEEDED       = 'event/delSucceeded';
const DEL_EVENT_FAILED          = 'event/delFailed';
const DEL_EVENT_CANCEL          = 'event/delCancel';

const LOAD_EVENTS_STARTED       = 'event/loadStarted';
const LOAD_EVENTS_SUCCEEDED     = 'event/loadSucceeded';
const LOAD_EVENTS_FAILED        = 'event/loadFailed';
const LOAD_EVENTS_CANCEL        = 'event/loadCancel';

const ATTEND_EVENT_STARTED      = 'event/attendStarted';
const ATTEND_EVENT_SUCCEEDED    = 'event/attendSucceeded';
const ATTEND_EVENT_FAILED       = 'event/attendFailed';
const ATTEND_EVENT_CANCEL       = 'event/attendCancel';

export const loadEvents = () => (dispatch, getState) =>
{
    log(`loadEVents started`);
    dispatch(action(LOAD_EVENTS_STARTED));
    let ok = false;
    return fetch(`${apiUrl}/event`, {method: 'GET', headers: authHeaders(getState().auth.token)})
        .then(res =>
        {
            ok = res.ok;
            return res.json();
        })
        .then(json =>
        {
            log(`loadEvents ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().event.isLoadingCancelled)
            {
                dispatch(action(ok ? LOAD_EVENTS_SUCCEEDED : LOAD_EVENTS_FAILED, json));
            }
        })
        .catch(err =>
        {
            log(`loadEvents err = ${err.message}`);
            if (!getState().event.isLoadingCancelled)
            {
                dispatch(action(LOAD_EVENTS_FAILED, {issue: [{error: err.message}]}));
            }
        });
};
export const cancelLoadEvents = () => action(LOAD_EVENTS_CANCEL);

export const saveEvent = (event) => (dispatch, getState) =>
{
    const body = JSON.stringify(event);
    log(`saveEvent started`);
    dispatch(action(SAVE_EVENT_STARTED));
    let ok = false;
    const url = event._id ? `${apiUrl}/event/${event._id}` : `${apiUrl}/event`;
    const method = event._id ? `PUT` : `POST`;
    return fetch(url, {method, headers: authHeaders(getState().auth.token), body})
        .then(res =>
        {
            ok = res.ok;
            return res.json();
        })
        .then(json =>
        {
            log(`saveEvent ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().event.isSavingCancelled)
            {
                dispatch(action(ok ? SAVE_EVENT_SUCCEEDED : SAVE_EVENT_FAILED, json));
            }
        })
        .catch(err =>
        {
            log(`saveEvent err = ${err.message}`);
            if (!getState().isSavingCancelled)
            {
                dispatch(action(SAVE_EVENT_FAILED, {issue: [{error: err.message}]}));
            }
        });
};
export const cancelSaveEvent = () => action(SAVE_EVENT_CANCEL);

export const attendEvent = (event) => (dispatch, getState) =>
{
    const body = JSON.stringify({eventId: event._id});
    log(`attendEvent started`);
    dispatch(action(ATTEND_EVENT_STARTED));
    
    let ok = false;
    const url = `${apiUrl}/event/attend`;
    const method = `POST`;
    
    return fetch(url, {method, headers: authHeaders(getState().auth.token), body})
        .then(res =>
        {
            ok = res.ok;
            return res.json();
        })
        .then(json =>
        {
            log(`attendEvent ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().event.isAttendingCancelled)
            {
                dispatch(action(ok ? ATTEND_EVENT_SUCCEEDED : ATTEND_EVENT_FAILED, json));
            }
            
            return json;
        })
        .catch(err =>
        {
            log(`attendEvent err = ${err.message}`);
            if (!getState().isAttendingCancelled)
            {
                dispatch(action(ATTEND_EVENT_FAILED, {issue: [{error: err.message, attend: err.attend}]}));
            }
        });
};
export const cancelAttendEvent = () => action(ATTEND_EVENT_CANCEL);

export const deleteEvent = (event) => (dispatch, getState) =>
{
    const body = JSON.stringify({_id: event._id});
    log(`deleteEvent started`);
    dispatch(action(DEL_EVENT_STARTED));

    let ok = false;
    const url = `${apiUrl}/event/${event._id}`;
    const method = `DELETE`;

    return fetch(url, {method, headers: authHeaders(getState().auth.token), body})
        .then(res =>
        {
            ok = res.ok;
            return res.json();
        })
        .then(json =>
        {
            log(`deleteEvent ok: ${ok}, json: ${JSON.stringify(json)}`);
            if (!getState().event.isDeletingCancelled)
            {
                dispatch(action(ok ? DEL_EVENT_SUCCEEDED : DEL_EVENT_FAILED, json));
            }

            return json;
        })
        .catch(err =>
        {
            log(`deleteEvent err = ${err.message}`);
            if (!getState().isDeletingCancelled)
            {
                dispatch(action(DEL_EVENT_FAILED, {issue: [{error: err.message}]}));
            }
        });
};
export const cancelDeleteEvent = () => action(DEL_EVENT_CANCEL);


export const eventReducer = (state = {items: [], isLoading: false, isSaving: false}, action) =>
{ //newState (new object)
    switch (action.type)
    {
        // load events
        case LOAD_EVENTS_STARTED:
            return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
        case LOAD_EVENTS_SUCCEEDED:
            return {...state, items: action.payload, isLoading: false};
        case LOAD_EVENTS_FAILED:
            return {...state, issue: action.payload.issue, isLoading: false};
        case LOAD_EVENTS_CANCEL:
            return {...state, isLoading: false, isLoadingCancelled: true};
        
        
        // save event
        case SAVE_EVENT_STARTED:
            return {...state, isSaving: true, isSavingCancelled: false, issue: null};
        case SAVE_EVENT_SUCCEEDED:
            let items = [...state.items];
            let index = items.findIndex((i) => i._id == action.payload._id);
            if (index != -1)
            {
                items.splice(index, 1, action.payload);
            }
            else
            {
                items.push(action.payload);
            }
            return {...state, items, isSaving: false};
        case SAVE_EVENT_FAILED:
            return {...state, issue: action.payload.issue, isSaving: false};
        case SAVE_EVENT_CANCEL:
            return {...state, isSaving: false, isSavingCancelled: true};
        
        
        //attend event
        case ATTEND_EVENT_STARTED:
            return {...state, isAttending: true, isAttendingCancelled: false, issue: null};
        case ATTEND_EVENT_SUCCEEDED:
            return {...state, attend: action.payload, isAttendingCancelled: false, issue: null};
        case ATTEND_EVENT_FAILED:
            return {...state, issue: action.payload.issue, isAttending: false};
        case ATTEND_EVENT_CANCEL:
            return {...state, isAttending: false, isAttendingCancelled: true};

        // del event
        case DEL_EVENT_STARTED:
            return {...state, isDeleting: true, isDeletingCancelled: false, issue: null};
        case DEL_EVENT_SUCCEEDED:
            return {...state, isDeleting: action.payload, isDeletingCancelled: false, issue: null};
        case DEL_EVENT_FAILED:
            return {...state, issue: action.payload.issue, isDeleting: false};
        case DEL_EVENT_CANCEL:
            return {...state, isDeleting: false, isDeletingCancelled: true};

        default:
            return state;
    }
};

