import {getLogger} from '../utils/utils';
import {apiUrl, authHeaders} from '../utils/api';
const log = getLogger('event/service');
const action = (type, payload) => ({type, payload});

const SAVE_EVENT_STARTED = 'event/saveStarted';
const SAVE_EVENT_SUCCEEDED = 'event/saveSucceeded';
const SAVE_EVENT_FAILED = 'event/saveFailed';
const CANCEL_SAVE_EVENT = 'event/cancelSave';

const LOAD_EVENTS_STARTED = 'event/loadStarted';
const LOAD_EVENTS_SUCCEEDED = 'event/loadSucceeded';
const LOAD_EVENTS_FAILED = 'event/loadFailed';
const CANCEL_LOAD_EVENTS = 'event/cancelLoad';

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
export const cancelLoadEvents = () => action(CANCEL_LOAD_EVENTS);

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
export const cancelSaveEvent = () => action(CANCEL_SAVE_EVENT);

export const eventReducer = (state = {items: [], isLoading: false, isSaving: false}, action) =>
{ //newState (new object)
    switch (action.type)
    {
        case LOAD_EVENTS_STARTED:
            return {...state, isLoading: true, isLoadingCancelled: false, issue: null};
        case LOAD_EVENTS_SUCCEEDED:
            return {...state, items: action.payload, isLoading: false};
        case LOAD_EVENTS_FAILED:
            return {...state, issue: action.payload.issue, isLoading: false};
        case CANCEL_LOAD_EVENTS:
            return {...state, isLoading: false, isLoadingCancelled: true};
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
        case CANCEL_SAVE_EVENT:
            return {...state, isSaving: false, isSavingCancelled: true};
        default:
            return state;
    }
};

