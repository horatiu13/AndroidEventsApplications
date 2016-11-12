import React, {Component} from 'react';
import {Text, View, TextInput, StyleSheet, ActivityIndicator, TouchableNativeFeedback} from 'react-native';
import {login} from './service';
import {getLogger, registerRightAction, issueText} from '../utils/utils';
import styles from '../utils/styles';

const log = getLogger('Login');

const LOGIN_ROUTE = 'auth/login';

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

export class Login extends Component {
    static get routeName()
    {
        return LOGIN_ROUTE;
    }
    
    static get route()
    {
        return {name: LOGIN_ROUTE, title: 'Authentication', rightText: 'Login'};
    }
    
    constructor(props)
    {
        super(props);
        this.state = {username: '', password: ''};
        log('constructor');
    }
    
    componentWillMount()
    {
        log('componentWillMount');
        this.updateState();
        registerRightAction(this.props.navigator, this.onLogin.bind(this));
    }
    
    render()
    {
        log('render');
        const auth = this.state.auth;
        let message = issueText(auth.issue);
        return (
            <View style={styles.content}>
                <ActivityIndicator animating={auth.inprogress} style={styles.activityIndicator} size="large"/>
                
                <Text>Username</Text>
                <TextInput onChangeText={(text) => this.setState({...this.state, username: text})}/>
                
                <Text>Password</Text>
                <TextInput secureTextEntry={true} onChangeText={(text) => this.setState({...this.state, password: text})}/>
    
    
                <TouchableNativeFeedback onPress={() => {this.props.onRegisterPress();}} background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={{width: 150, height: 100, backgroundColor: 'red'}}>
                        <Text style={{margin: 30}}>Register</Text>
                    </View>
                </TouchableNativeFeedback>
    
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
    
    onLogin()
    {
        log('onLogin');
        this.props.store.dispatch(login(this.state)).then(() =>
        {
            if (this.state.auth.token)
            {
                this.props.onAuthSucceeded(this.state.username);
            }
        });
    }
}