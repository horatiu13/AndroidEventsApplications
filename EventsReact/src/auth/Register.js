import React, {Component} from 'react';
import {
    Text,
    View,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    TouchableNativeFeedback,
    DatePickerAndroid,
    TouchableWithoutFeedback
} from 'react-native';
import CheckBox from 'react-native-checkbox';
import {login} from './service';
import {getLogger, registerRightAction, issueText} from '../utils/utils';
import styles from '../utils/styles';

const log = getLogger('Register');

const REGISTER_ROUTE = 'auth/signup';

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

export class Register extends Component {
    static get routeName()
    {
        return REGISTER_ROUTE;
    }
    
    static get route()
    {
        return {name: REGISTER_ROUTE, title: 'Register', rightText: 'Create'};
    }
    
    constructor(props)
    {
        super(props);
        this.state = {username: '', password: '', mail: '', birthDate: null, city: '', isOrg: false};
        this.userDate = "Birth Date: ";
        log('constructor');
    }
    
    componentWillMount()
    {
        log('componentWillMount');
        this.updateState();
        registerRightAction(this.props.navigator, this.onCreate.bind(this));
    }
    
    render()
    {
        log('render');
        const auth = this.state.auth;
        let message = issueText(auth.issue);
        
        return (
            <View style={styles.registerContent}>
                <ActivityIndicator animating={auth.inprogress} style={styles.activityIndicator} size="large"/>
                
                <Text>Username</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, username: text})}/>
                
                <Text>Password</Text>
                <TextInput secureTextEntry={true} onChangeText={(text) => this.setState({...this.state, password: text})}/>
                
                <Text>EMail</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, mail: text})}/>
                
                <Text>City</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, city: text})}/>
                
                <Text>{this.userDate}</Text>
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
    
                
                <CheckBox
                    label='Organizer'
                    checked={this.state.isOrg}
                    onChange={(checked) => {this.setState({...this.state, isOrg: checked}); log(`aa: ${checked}`);}}
                />
                
                {message && <Text>{message}</Text>}
            </View>
        );
    }
    
    componentDidMount()
    {
        log(`componentDidMount`);
        this.unsubscribe = this.props.store.subscribe(() => this.updateState());
    }
    
    componentWillUnmount()
    {
        log(`componentWillUnmount`);
        this.unsubscribe();
    }
    
    updateState()
    {
        log(`updateState - ${this.state.username}`);
        this.setState({...this.state, auth: this.props.store.getState().auth});
    }
    
    onCreate()
    {
        log('onCreate');
        // this.props.store.dispatch(login(this.state)).then(() =>
        // {
        //     if (this.state.auth.token)
        //     {
        //         this.props.onAuthSucceeded(this.state.username);
        //     }
        // });
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
                
                this.userDate = 'Birth Date: ' + date.toDateString();
                this.setState({...this.state, birthDate: date});
            }
        }
        catch ({code, message})
        {
            log(`Error while trying to open date picker '${stateKey}':  ${message}`);
        }
    };
}