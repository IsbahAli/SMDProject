import {View, Text, Image} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MatIcons from 'react-native-vector-icons/MaterialIcons';
import ProfilePage from './profilepg';
import MainProfilePage from './profilescr';
import HomePage from './homepg';
import AddItemPage from './addItempg';

// import {createDrawerNavigator} from '@react-navigation/drawer';

const Tab = createBottomTabNavigator();
const HomeTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: tabInfo => {
            return (
              <MatIcons
                name="home"
                size={24}
                color={tabInfo.focused ? 'black' : '#8e8e93'}
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: 12,
            color: 'black',
          },
        }}
      />
      {/* <Tab.Screen
        name="Chats"
        component={Settings}
        options={{
          tabBarIcon: tabInfo => {
            return (
              <MatIcons
                name="settings"
                size={24}
                color={tabInfo.focused ? '#006600' : '#8e8e93'}
              />
            );
          },
        }}
      /> */}
      {/* <Tab.Screen
        name="Sell"
        component={Profile}
        options={{
          tabBarIcon: tabInfo => {
            return (
              <MatIcons
                name="account-circle"
                size={24}
                color={tabInfo.focused ? '#006600' : '#8e8e93'}
              />
            );
          },
        }}
      /> */}
      {/* <Tab.Screen name="Screen 2" component={ContextTab} /> */}
      <Tab.Screen
        name="Add"
        component={AddItemPage}
        options={{
          tabBarIcon: tabInfo => {
            return (
              <MatIcons
              name={tabInfo.focused ? 'add-circle' : 'add-circle-outline'}
              size={28}
              color="black"
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: 12,
            color: 'black',
          },
        }}
      />
      <Tab.Screen
        name="Account"
        component={MainProfilePage}
        options={{
          tabBarIcon: tabInfo => {
            return (
              <MatIcons
              name={tabInfo.focused ? 'person' : 'person-outline'}
              size={24}
              color="black"
              />
            );
          },
          tabBarLabelStyle: {
            fontSize: 12,
            color: 'black',
          },
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
