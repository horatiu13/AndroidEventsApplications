import React, {Component} from 'react';
import {Text, View, Navigator, TouchableOpacity, StyleSheet} from 'react-native';
import {EventList, EventEdit} from './event';
import {Login, Register} from './auth';
import {getLogger} from './utils/utils';

const log = getLogger('Router');

export class Router extends Component {
    constructor(props)
    {
        log(`constructor`);
        super(props);
        this.username = null;
    }
    
    render()
    {
        log(`render`);
        return (
            <Navigator
                initialRoute={Login.route}
                renderScene={this.renderScene.bind(this)}
                ref={(navigator) => this.navigator = navigator}
                navigationBar={
                    <Navigator.NavigationBar
                        style={styles.navigationBar}
                        routeMapper={NavigationBarRouteMapper}
                    />
                }/>
        );
    }
    
    componentDidMount()
    {
        log(`componentDidMount`);
    }
    
    componentWillUnmount()
    {
        log(`componentWillUnmount`);
    }
    
    renderScene(route, navigator)
    {
        log(`renderScene ${route.name}`);
        
        this.nav = navigator;
        switch (route.name)
        {
            case Login.routeName:
                log(`renderScene: ${Login.routeName}`);
                return <Login
                    store={this.props.store}
                    navigator={navigator}
                    onAuthSucceeded={(username) => this.onAuthSucceeded(username)}
                    onRegisterPress={() => this.onRegisterPress()} // onRegisterPress={this.onRegisterPress} // daca nici asa nu merge imi bag ****
                />;
            
            case EventEdit.routeName:
                log(`renderScene: ${EventEdit.routeName}`);
                return <EventEdit
                    store={this.props.store}
                    navigator={navigator}
                    username={this.username}
                />;
            
            case Register.routeName:
                log(`renderScene: ${Register.routeName}`);
                return <Register
                    store={this.props.store}
                    navigator={navigator}
                    onAuthSucceeded={(username) => this.onAuthSucceeded(username)} // daca o se face acelasi lucru ca la login??????????
                />;
            
            case EventList.routeName:
            default:
                log(`renderScene: ${EventList.routeName} or default`);
                return <EventList
                    store={this.props.store}
                    navigator={navigator}
                    username={this.username}
                />
        }
    };
    
    onRegisterPress()
    {
        log('cineva vrea sa isi faca cont nou... ');
        this.navigator.push(Register.route);
    }
    
    onAuthSucceeded(username)
    {
        this.nav.replace({ id: Login.routeName });
        this.nav.replace({ id: Register.routeName });
        
        this.username = username;
        this.navigator.push(EventList.route);
    }
}


const NavigationBarRouteMapper = {
    /**
     * @return {null}
     */
    LeftButton(route, navigator, index, navState) {
        if (index > 0)
        {
            return (
                <TouchableOpacity
                    onPress={() =>
                    {
                        if (route.leftAction)
                        {
                            route.leftAction();
                        }
                        if (index > 0)
                        {
                            navigator.pop();
                        }
                    }}>
                    <Text style={styles.leftButton}>Back</Text>
                </TouchableOpacity>
            )
        }
        else
        {
            return null;
        }
    },
    
    RightButton(route, navigator, index, navState) {
        if (route.rightText)
        {
            return (
                <TouchableOpacity
                    onPress={() => route.rightAction()}>
                    <Text style={styles.rightButton}>
                        {route.rightText}
                    </Text>
                </TouchableOpacity>
            )
        }
    },
    
    Title(route, navigator, index, navState) {
        return (<Text style={styles.title}>{route.title}</Text>)
    }
};

const styles = StyleSheet.create({
    navigationBar: {
        backgroundColor: 'blue',
    },
    leftButton: {
        color: '#ffffff',
        margin: 10,
        fontSize: 17,
    },
    title: {
        paddingVertical: 10,
        color: '#ffffff',
        justifyContent: 'center',
        fontSize: 18
    },
    rightButton: {
        color: 'white',
        margin: 10,
        fontSize: 16
    },
    content: {
        marginTop: 90,
        marginLeft: 20,
        marginRight: 20,
    },
});