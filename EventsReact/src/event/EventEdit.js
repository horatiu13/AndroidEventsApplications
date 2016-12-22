import React, {Component} from 'react';
import {Text, View, TextInput, ActivityIndicator, DatePickerAndroid, TouchableNativeFeedback} from 'react-native';
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
                
                <Text>Name</Text>
                {/*<TextInput value={state.event.name} onChangeText={(name) => this.updateEventText(name)}></TextInput> -- asta ii aia originala de la lazar*/}
                <TextInput value={state.event.name} onChangeText={(text) => {this.updateName(text)}}/>

                <Text>City</Text>
                <TextInput value={state.event.city} onChangeText={(text) => {this.updateCity(text)}}/>

                <Text>Date</Text>
                <Text>{(new Date(state.event.date)).toString()}</Text>
                <TouchableNativeFeedback
                    onPress={this.showPicker.bind(this, 'present', {
                        date: new Date(),
                        minDate: new Date(1900, 1, 1),
                        maxDate: new Date(),
                    })}>
                    <View>
                        <Text style={styles.text}>Pick a date</Text>
                    </View>
                </TouchableNativeFeedback>
                
                <Text>Minimum Age</Text>
                <TextInput value={state.event.minAge.toString()} onChangeText={(text) => {this.updateMinAge(Number(text))}}/>

                <Text>Number of atendees</Text>
                <TextInput value={state.event.attend.toString()} onChangeText={(text) => {this.updateAttend(Number(text))}}/>

                <Text>Capacity</Text>
                <TextInput value={state.event.maxCap.toString()} onChangeText={(text) => {this.updateMaxCap(Number(text))}}/>


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
    
    showPicker = async(stateKey, options) =>
    {
        try
        {
            var newState = {};
            const {action, year, month, day} = await DatePickerAndroid.open(options);
            if (action === DatePickerAndroid.dismissedAction)
            {
                newState[stateKey + 'Text'] = 'dismissed';
            }
            else
            {
                var date = new Date(year, month, day);
                newState[stateKey + 'Text'] = date.toLocaleDateString();
                newState[stateKey + 'Date'] = date;

                log(`${date}`);
                
                let aux = this.state;
                this.state.event.date = date;
                this.setState(aux);
                // this.setState({...this.state, birthDate: date});
            }
        }
        catch ({code, message})
        {
            log(`Error while trying to open date picker '${stateKey}':  ${message}`);
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
}