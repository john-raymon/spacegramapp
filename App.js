import React, {useState, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HttpAgent from './httpAgent';
// import CurrentRoomScreen from './screens/CurrentRoomScreen';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  StatusBar,
} from 'react-native';

const {Navigator: RootNavigator, Screen: RootScreen} = createStackNavigator();

const {Navigator: MainNavigator, Screen: MainScreen} = createStackNavigator();

const HomeScreen = ({navigation}) => {
  return (
    <View>
      <Text>
        Welcome, You're logged in!
        <Button
          onPress={() => navigation.navigate('testScreen')}
          title="open screen">
          Test screen
        </Button>
        <Button
          onPress={() => navigation.navigate('roomModal')}
          title="open modal">
          Open room
        </Button>
      </Text>
    </View>
  );
};

const TestScreen = ({navigation}) => {
  return (
    <View>
      <Text>Test Screen</Text>
      <Button
        onPress={() => navigation.navigate('roomModal')}
        title="open modal">
        Go to modal
      </Button>
    </View>
  );
};

const SignInScreen = ({navigation, updateAuth}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  function attemptLogin() {
    const httpAgent = new HttpAgent('http://b5e48a7b198c.ngrok.io/api');
    httpAgent
      ._post('/users/login', {
        email,
        password,
      })
      .then((res) => {
        if (res.success) {
          updateAuth(true);
        }
      })
      .catch((error) => {
        console.log('there was an error while logging in', {error});
      });
  }
  return (
    <View>
      <Text>Sign In</Text>
      <TextInput
        placeholder="email"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        placeholder="password"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
      <Button title="Login" onPress={attemptLogin} />
    </View>
  );
};

const MainStack = ({isAuth, updateAuth}) => {
  return (
    <MainNavigator initialRouteName="HomeScreen" mode="card">
      {isAuth ? (
        <>
          <MainScreen name="homeScreen" component={HomeScreen} />
          <MainScreen name="testScreen" component={TestScreen} />
        </>
      ) : (
        <MainScreen name="signInScreen">
          {(props) => <SignInScreen {...props} updateAuth={updateAuth} />}
        </MainScreen>
      )}
    </MainNavigator>
  );
};

const CurrentRoomScreen = ({navigation}) => {
  return (
    <View>
      <Text>Current Room Screen modal</Text>
      <Button
        onPress={() => navigation.goBack()}
        title="go back to other rooms"
      />
      <Button
        onPress={() => navigation.navigate('testScreen')}
        title="open test screen"
      />
      <Button
        onPress={() => navigation.navigate('roomModal')}
        title="open modal"
      />
    </View>
  );
};

const App = () => {
  // get persisted isAuth value from storage, and set global isAuth state for app
  // let this dictate showing the proper stack
  // if isAuth is false, or that isn't any isAuth state persisted, the logged out screens
  // will show
  // if isAuth is true then the logged in screens will show, and any authenticated request from there
  // will attempt to use the persisted JWT token, if any unauthorized error is returned then the JWT
  // key will be cleared and isAuth modified in the app state, and in the persisted storage
  // The http agent wrapping Axios will handle fetching the JWT from the storage and including it in the
  // the request
  const [isLoading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [isAuth, setIsAuth] = useState(null);

  function updateAuth(isAuth) {
    AsyncStorage.setItem('@isAuth', `${isAuth}`).then(() => {
      setIsAuth(isAuth);
    });
  }

  useEffect(() => {
    AsyncStorage.getItem('@isAuth')
      .then((persistedIsAuth) => {
        console.log('the persisted auth is', {persistedIsAuth});
        updateAuth(JSON.parse(persistedIsAuth));
      })
      .catch((error) => {
        updateAuth(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // on isAuth changes, we check if a user is authenticated then attempt to fetch the user's data
  useEffect(() => {
    const httpAgent = new HttpAgent('http://b5e48a7b198c.ngrok.io/api');
    if (isAuth) {
      httpAgent
        ._get('/users')
        .then((user) => {
          console.log('response');
          setAuthUser(user);
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
              // lacking valid authentication credentials for the target resource
              HttpAgent.setToken('@secureJwt', '')
                .then(() => {
                  updateAuth(false);
                  setAuthUser(null);
                })
                .catch(() => {
                  console.log('error while resetting JWT');
                });
            }
            // console.log(error.response.data);
            // console.log(error.response.status);
            // console.log(error.response.headers);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log('error', {...error});
        });
    }
  }, [isAuth]);

  if (isLoading) {
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator mode="modal">
        <RootScreen name="mainStack" options={{headerShown: false}}>
          {(props) => (
            <MainStack {...props} isAuth={isAuth} updateAuth={updateAuth} />
          )}
        </RootScreen>
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
