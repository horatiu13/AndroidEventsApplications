import React, {Component} from 'react';
import {Text, View, StyleSheet, TouchableHighlight} from 'react-native';

export class EventView extends Component {
    constructor(props)
    {
        super(props);
        this.username = props.username;
    }
    
    render()
    {
        
        if (this.props.event.orgName === this.username)
        {
            // eveniment creeat de acelasi user
            return (
                <TouchableHighlight onHold={() => this.props.onPress(this.props.event)}>
                    <View style={styles.listItem}>
                        <Text style={StyleSheet.flatten([styles.details, styles.title])}>{this.props.event.name}</Text>
                        <Text style={styles.details}>`City: ${this.props.event.city}`</Text>
                    </View>
                </TouchableHighlight>
            );
        }
        else
        {
            // eveniment creeat de ALT user
            return (
                <TouchableHighlight onHold={() => this.props.onPress(this.props.event)}>
                    <View style={styles.listItem}>
                        <Text style={StyleSheet.flatten([styles.details])}>{this.props.event.name}</Text>
                        <Text style={styles.details}>`City: ${this.props.event.city}`</Text>
                    </View>
                </TouchableHighlight>
            );
        }
    }
}
// StyleSheet.flatten([styles.listItem, styles.selectedListItem])
const styles = StyleSheet.create({
    title:{
        color: 'red'
    },
    details:{
        fontSize: 16
    },
    listItem: {
        margin: 10,
        borderBottomColor: '#bbb',
        borderBottomWidth: 5
    }
});