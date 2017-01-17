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
        let d = new Date(this.props.event.date);
        let dateString = d.getDay() + "." + d.getMonth() + "." + d.getFullYear() + " " + d.getHours() + ":" + d.getMinutes();
        
        if (this.props.event.orgName === this.username)
        {
            // eveniment creeat de acelasi user
            return (
                <TouchableHighlight onPress={() => this.props.onPressEdit(this.props.event)}>
                    <View style={styles.listItem}>
                        <Text style={StyleSheet.flatten([styles.details, styles.editableText])}>{this.props.event.name} (EDIT)</Text>
                        <Text style={[styles.details, styles.editableText]}>Date: {dateString}</Text>
                    </View>
                </TouchableHighlight>
            );
        }
        else
        {
            // eveniment creeat de ALT user
            return (
                <TouchableHighlight onPress={() => this.props.onPressDetails(this.props.event)}>
                    <View style={styles.listItem}>
                        <Text style={StyleSheet.flatten([styles.details])}>{this.props.event.name}</Text>
                        <Text style={[styles.detail]}>Date: {dateString}</Text>
                    </View>
                </TouchableHighlight>
            );
        }
    }
}
// StyleSheet.flatten([styles.listItem, styles.selectedListItem])
const styles = StyleSheet.create({
    editableText:{
        color: 'blue'
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