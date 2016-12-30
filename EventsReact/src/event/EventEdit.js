import React, {Component} from 'react';
//noinspection JSUnresolvedVariable
import {Text, View, TextInput, ActivityIndicator, DatePickerAndroid, TimePickerAndroid, TouchableNativeFeedback, Button} from 'react-native';
import {saveEvent, deleteEvent, cancelSaveEvent} from './service';
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
            this.state = {event: {orgName: this.username}, isSaving: false};
        }
        registerRightAction(this.props.navigator, this.onSave.bind(this));
    }
    
    render()
    {
        log('render');
        const state = this.state;
        let message = issueText(state.issue);
        let evDate = state.event.date ? new Date(state.event.date) : new Date();
        
        evDate.setMilliseconds(0);
        evDate.setSeconds(0);
        this.state.event.date = evDate;
        
        let minAge = state.event.minAge || state.event.minAge == 0 ? state.event.minAge.toString() : "";
        let maxCap = state.event.maxCap || state.event.maxCap == 0? state.event.maxCap.toString() : "";
        let attend = state.event.attend || state.event.attend == 0? state.event.attend.toString() : "";
        
        let deleteText = state.event._id ? "Delete" : "";
        
        return (
            <View style={styles.content}>
                { state.isSaving &&
                <ActivityIndicator animating={true} style={styles.activityIndicator} size="large"/>
                }
                
                <Text>Name</Text>
                <TextInput value={state.event.name} onChangeText={(text) => {this.updateName(text)}}/>

                <Text>City</Text>
                <TextInput value={state.event.city} onChangeText={(text) => {this.updateCity(text)}}/>

                <Text>Address</Text>
                <TextInput value={state.event.address} onChangeText={(text) => {this.updateAddress(text)}}/>

                <Text>Date: {evDate.toString()}</Text>
                
                <TouchableNativeFeedback
                    onPress={this.showDatePicker.bind(this, {
                        date: new Date(evDate),
                        minDate: new Date(),
                        maxDate: new Date(3000, 1, 1),
                    })}>
                    <View>
                        <Text style={styles.selectableText}>Change Date</Text>
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback
                    onPress={this.showTimePicker.bind(this, { 
                        hour: evDate.getHours(), 
                        minute: evDate.getMinutes(), 
                        is24Hour: true
                    })}>
                    <View>
                        <Text style={styles.selectableText}>Change Hour</Text>
                    </View>
                </TouchableNativeFeedback>


                <Text>Minimum Age</Text>
                <TextInput value={minAge} onChangeText={(text) => {this.updateMinAge(Number(text))}}/>

                <Text>Number of atendees</Text>
                <TextInput value={attend} onChangeText={(text) => {this.updateAttend(Number(text))}}/>

                <Text>Capacity</Text>
                <TextInput value={maxCap} onChangeText={(text) => {this.updateMaxCap(Number(text))}}/>

                <TouchableNativeFeedback onPress={this.onDelete.bind(this)}>
                    <View>
                        <Text style={styles.deleteButton}>{deleteText}</Text>
                    </View>
                </TouchableNativeFeedback>
                           
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
    
    updateName(name)
    {
        let newState = {...this.state};
        newState.event.name = name;
        this.setState(newState);
    }
    
    updateCity(city)
    {
        let newState = {...this.state};
        newState.event.city = city;
        this.setState(newState);
    }

    updateAddress(address)
    {
        let newState = {...this.state};
        newState.event.address = address;
        this.setState(newState);
    }
    
    updateMinAge(age)
    {
        let newState = {...this.state};
        newState.event.minAge = age;
        this.setState(newState);
    }

    updateAttend(attend)
    {
        let newState = {...this.state};
        newState.event.attend = attend;
        
        this.setState(newState);
    }

    updateMaxCap(cap)
    {
        let newState = {...this.state};
        newState.event.maxCap = cap;
        this.setState(newState);
    }

    showDatePicker = async(options) =>
    {
        try
        {
            var auxDate = new Date(this.state.event.date);
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            
            if (action === DatePickerAndroid.dateSetAction)
            {
                var date = new Date(year, month, day);
                
                date.setHours(auxDate.getHours());
                date.setMinutes(auxDate.getMinutes());
                date.setSeconds(0);
                date.setMilliseconds(0);
                
                let newState2 = {...this.state};
                newState2.event.date  = date;
                this.setState(newState2);
            }
        }
        catch ({code, message})
        {
            log(`Error while trying to open date picker:  ${message}`);
        }
    };

    showTimePicker = async (options) => { 
        try 
        { 
            const {action, minute, hour} = await TimePickerAndroid.open(options); 
             
            if (action === TimePickerAndroid.timeSetAction) 
            {
                let newState = {...this.state};
                var date = new Date(this.state.event.date); 
                date.setMinutes(minute);
                date.setHours(hour);
                date.setSeconds(0);
                date.setMilliseconds(0);
                
                newState.event.date = date; 
                this.setState(newState); 
            }
        } 
        catch ({code, message}) 
        { 
            log(`Error in showTimePicker ${message}`); 
        } 
    };
    
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

    onDelete()
    {
        log('onDelete');
        this.props.store.dispatch(deleteEvent(this.state.event)).then(() =>
        {
            log('onEventDeleted');
            if (!this.state.issue)
            {
                this.props.navigator.pop();
            }
        });
    }

}