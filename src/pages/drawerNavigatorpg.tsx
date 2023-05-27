import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import HomePage from './homepg';
import LogoutPage from './logoutpg';
import ProfilePage from './profilepg';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props:any) => {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <LogoutPage navigation={props.navigation}/>
    </DrawerContentScrollView>
  );
};

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={HomePage} />
      <Drawer.Screen name="Profile" component={ProfilePage} />

    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
