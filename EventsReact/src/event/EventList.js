import React, {Component} from 'react';
import {ListView, Text, View, StatusBar, ActivityIndicator} from 'react-native';
import {EventEdit} from './EventEdit';
import {EventView} from './EventView';
import {EventDetails} from './EventDetails';
import {loadEvents, cancelLoadEvents} from './service';
import {registerRightAction, getLogger, issueText} from '../utils/utils';
import styles from '../utils/styles';

const log = getLogger('EventList');
const EVENT_LIST_ROUTE = 'event/list';

export class EventList extends Component {
    
    static get routeName()
    {
        return EVENT_LIST_ROUTE;
    }
    
    
    static get routeOrg()
    {
        log('routeOrg');
        return [{name: EVENT_LIST_ROUTE, title: 'Event List', rightText: 'New'}];
    }
    
    static get routeUser()
    {
        log('routeUser');
        
        return [{name: EVENT_LIST_ROUTE, title: 'Event List'}];
    }
    
    constructor(props)
    {
        super(props);
        log('constructor');
        this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1.id !== r2.id});
        const eventState = this.props.store.getState().event;
        this.username = this.props.username;
        this.curUser = this.props.curUser;
        this.state = {isLoading: eventState.isLoading, dataSource: this.ds.cloneWithRows(eventState.items)};
        
        if (this.curUser.isOrg) 
        {
            registerRightAction(this.props.navigator, this.onNewEvent.bind(this));
        }
    }
    
    render()
    {
        log(`---------------------------------------------------- ${this.username} ----------------------------------------------------`)
    
        log('render');
        let message = issueText(this.state.issue);
        return (
            <View style={styles.content}>
                {
                    this.state.isLoading &&
                    <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                {message && <Text>{message}</Text>}
                <ListView
                    dataSource={this.state.dataSource}
                    enableEmptySections={true}
                    renderRow={event => (<EventView 
                        username={this.username} 
                        event={event} 
                        onPressDetails={(event) => this.onEventPressDetails(event)} 
                        onPressEdit={(event) => this.onEventPressEdit(event)}
                    />)}/>
            </View>
        );
    }
    
    onNewEvent()
    {
        log('onNewEvent');
        this.props.navigator.push({...EventEdit.route});
    }

    onEventPressDetails(event)
    {
        log('onEventPressDetails');
        this.props.navigator.push({...EventDetails.route, data: event});
    }

    onEventPressEdit(event)
    {
        log('onEventPressEdit');
        this.props.navigator.push({...EventEdit.route, data: event});
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
            this.setState({dataSource: this.ds.cloneWithRows(eventState.items), isLoading: eventState.isLoading});
        });
        store.dispatch(loadEvents());
    }
    
    componentWillUnmount()
    {
        log('componentWillUnmount');
        this._isMounted = false;
        this.unsubscribe();
        this.props.store.dispatch(cancelLoadEvents());
    }
}
