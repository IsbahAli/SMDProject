import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MatIcons from 'react-native-vector-icons/MaterialIcons';
import HomePage from './homepg';
import ChatPage from './chatpg';
import AddItemPage from './addItempg';
import MyAdsPage from './myadpg';
import MainProfilePage from './profilescr';
import GMap from './gmaps';

const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: tabInfo => (
            <MatIcons
              name="home"
              size={24}
              color={tabInfo.focused ? 'black' : '#8e8e93'}
            />
          ),
          headerShown: false, // Hide the header at the top
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatPage}
        options={{
          tabBarIcon: tabInfo => (
            <MatIcons
              name="chat"
              size={24}
              color={tabInfo.focused ? 'black' : '#8e8e93'}
            />
          ),
          headerShown: false, // Hide the header at the top
        }}
      />
      <Tab.Screen
        name="Post Ad"
        component={AddItemPage}
        options={{
          tabBarIcon: tabInfo => (
            <MatIcons
              name={tabInfo.focused ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color="black"
            />
          ),
          headerShown: false, // Hide the header at the top
        }}
      />
      <Tab.Screen
        name="Account"
        component={MainProfilePage}
        options={{
          tabBarIcon: tabInfo => (
            <MatIcons
              name={tabInfo.focused ? 'person' : 'person-outline'}
              size={24}
              color="black"
            />
          ),
          headerShown: false, // Hide the header at the top
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
