import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// import CurrentRoomScreen from './screens/CurrentRoomScreen';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  Button,
  StatusBar,
} from 'react-native';

const { Navigator:RootNavigator, Screen:RootScreen } = createStackNavigator();

const { Navigator:MainNavigator, Screen:MainScreen } = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  return (
    <View>
      <Text>
        Welcome, You're logged in!
        <Button onPress={() => navigation.navigate('roomModal')} title="open modal">Open room</Button>
      </Text>
    </View>
  )
}

const SignInScreen = ({ navigation }) => {
  return (
    <View>
      <Text>
        Sign In
      </Text>
    </View>
  )
}
const MainStack = () => {
  return (
    <MainNavigator initialRouteName="HomeScreen">
      {
        true ?
        <MainScreen name="homeScreen" component={HomeScreen} />
        : 
        <MainScreen name="signInScreen" component={SignInScreen} />
      }
    </MainNavigator>
  )
}

const CurrentRoomScreen = ({ navigation }) => {
  return (
    <View>
      <Text>Current Room Screen modal</Text>
      <Button onPress={() => navigation.goBack()} title="go back to other rooms" />
      <Button onPress={() => navigation.navigate('roomModal')} title="open modal" />
    </View>
  )
}
const App = () => {
  return (
    <NavigationContainer>
      <RootNavigator mode="modal">
        <RootScreen name="mainStack" component={MainStack} options={{ headerShown: false }} />
        <RootScreen name="roomModal" component={CurrentRoomScreen} />
      </RootNavigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  footer: {
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;
