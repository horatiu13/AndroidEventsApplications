import React, {Component} from 'react';
import {AppRegistry} from 'react-native';
import {createStore, applyMiddleware, combineReducers} from 'redux';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import {eventReducer} from './src/event';
import {authReducer} from './src/auth';
import {Router} from './src/Router'

const rootReducer = combineReducers({event: eventReducer, auth: authReducer});
const store = createStore(rootReducer, applyMiddleware(thunk, createLogger()));
// const store = createStore(rootReducer, applyMiddleware(thunk));

export default class EventsReact extends Component {
    render() {
        return (
            <Router store={store}/>
        );
    };
};

AppRegistry.registerComponent('EventsReact', () => EventsReact);
