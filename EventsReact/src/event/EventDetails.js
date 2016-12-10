import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator, StyleSheet} from 'react-native';
import {attendEvent, cancelAttendEvent} from './service';
import {registerRightAction, issueText, getLogger} from '../utils/utils';
import styles from '../utils/styles';
import dateFormat from 'dateformat';

const log = getLogger('EventDetails');
const EVENT_DETAILS_ROUTE = 'event/details';

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

export class EventDetails extends Component {
    static get routeName()
    {
        return EVENT_DETAILS_ROUTE;
    }

    static get route()
    {
        return {name: EVENT_DETAILS_ROUTE, title: 'Event Details', rightText: 'Attend'};
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
        registerRightAction(this.props.navigator, this.onAttend.bind(this));
    }

    render()
    {
        log('render');
        this.state.attend = this.state.event.attend;
        let state = this.state;
        const event = state.event;
        let message = issueText(this.state.issue);
        
        log(`Aici: ${this.state.event.attend} - ${event.attend}`);
        
        
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                <Text>Name</Text>
                <Text style={localStyle.separator}>{event.name}</Text>
                
                <Text>City</Text>
                <Text style={localStyle.separator}>{event.city}</Text>

                <Text>Date</Text>
                <Text style={localStyle.separator}>{dateFormat(new Date(event.date), "dddd, dd/mmmm/yyyy, HH:MM")}</Text>

                <Text>Minimum Age</Text>
                <Text style={localStyle.separator}>{event.minAge}</Text>

                <Text>Number of atendees / Capacity</Text>
                <Text style={localStyle.separator}>{event.attend} / {event.maxCap}</Text>

                <Text>Organizer</Text>
                <Text style={localStyle.separator}>{event.orgName}</Text>
                
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
        this.props.store.dispatch(cancelAttendEvent());
    }
    
    onAttend()
    {
        log('onAttend');
        
        this.props.store.dispatch(attendEvent(this.state.event))
            .then((response) =>
        {
            log('onAttendEvent');
            if (!this.state.issue)
            {
                let newState = this.state;
                this.state.event.attend = response.attend;
                this.state.attend       = response.attend;
                this.setState(newState);
            }
            else
            {
                log(`issue: ${JSON.stringify(this.state.issue)}`);//:: ${response.issue} :: ${response.state}`);
                
                let newState = this.state;
                this.state.event.attend = response.issue[0].attend;
                this.state.attend = response.issue[0].attend;
                this.state.issue = [{error: response.issue[0].error}];
                
                this.setState(newState);
            }
        });
    }
}

const localStyle = StyleSheet.create({
    separator: {
        margin: 10,
        borderBottomColor: '#bbb',
        borderBottomWidth: 5
    }
});