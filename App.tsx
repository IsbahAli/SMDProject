import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPage from './src/pages/loginpg';
import SignUpPage from './src/pages/signuppg';
import SplashPage from './src/pages/splashpg';
// import DrawerNavigator from './src/pages/drawerNavigatorpg';
import HomeTabs from './src/pages/hometabs';
import ProfilePage from './src/pages/profilepg';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer >
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={SplashPage} options={{ headerShown: false }} />
        <Stack.Screen name="LoginPg" component={LoginPage} options={{ headerShown: false }} />
        <Stack.Screen name="SignUpPg" component={SignUpPage} options={{ headerShown: false }} />
        <Stack.Screen name="HomePg" component={HomeTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfilePage} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
