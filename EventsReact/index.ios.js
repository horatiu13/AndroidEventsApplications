/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */


'use strict';

var React = require('react');
var ReactNative = require(('react-native'));

export default class EventsReact extends React.Component {
    render() {
        return React.createElement(ReactNative.Text, {style: styles.text}, "Saluuuuuuut");
//    (
//      <View style={styles.container}>
//        <Text style={styles.welcome}>
//          Welcome to React Native!
//        </Text>
//        <Text style={styles.instructions}>
//          To get started, edit index.ios.js
//        </Text>
//        <Text style={styles.instructions}>
//          Press Cmd+R to reload,{'\n'}
//          Cmd+D or shake for dev menu
//        </Text>
//      </View>
//    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'black',
    backgroundColor: 'white',
    fontSize: 30,
    margin: 80
  }
});

ReactNative.AppRegistry.registerComponent('EventsReact', () => EventsReact);
