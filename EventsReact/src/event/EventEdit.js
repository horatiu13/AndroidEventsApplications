import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator} from 'react-native';
import {saveEvent, cancelSaveEvent} from './service';
import {registerRightAction, issueText, getLogger} from '../utils/utils';
import styles from '../utils/styles';

const log = getLogger('EventEdit');
const EVENT_EDIT_ROUTE = 'event/edit';

export class EventEdit extends Component {
    static get routeName()
    {
        return EVENT_EDIT_ROUTE;
    }
    
    static get route()
    {
        return {name: EVENT_EDIT_ROUTE, title: 'Event Edit', rightText: 'Save'};
    }
    
    constructor(props)
    {
        log('constructor');
        super(props);
        this.username = props.username;
        const nav = this.props.navigator;
        const currentRoutes = nav.getCurrentRoutes();
        const currentRoute = currentRoutes[currentRoutes.length - 1];
        if (currentRoute.data)
        {
            this.state = {event: {...currentRoute.data}, isSaving: false};
        }
        else
        {
            this.state = {event: {name: ''}, isSaving: false};
        }
        registerRightAction(this.props.navigator, this.onSave.bind(this));
    }
    
    render()
    {
        log('render');
        const state = this.state;
        let message = issueText(state.issue);
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                <Text>Text</Text>
                <TextInput value={state.event.name} onChangeText={(name) => this.updateEventText(name)}></TextInput>
                {message && <Text>{message}</Text>}
            </View>
        );
    }
    
    componentDidMount()
    {
        log('componentDidMount');
        this._isMounted = true;
        const store = this.props.store;
        this.unsubscribe = store.subscribe(() =>
        {
            log('setState');
            const state = this.state;
            const eventState = store.getState().event;
            this.setState({...state, issue: eventState.issue});
        });
    }
    
    componentWillUnmount()
    {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        this.props.store.dispatch(cancelSaveEvent());
    }
    
    updateEventText(name)
    {
        let newState = {...this.state};
        newState.event.name = name;
        this.setState(newState);
    }
    
    onSave()
    {
        log('onSave');
        this.props.store.dispatch(saveEvent(this.state.event)).then(() =>
        {
            log('onEventSaved');
            if (!this.state.issue)
            {
                this.props.navigator.pop();
            }
        });
    }
}