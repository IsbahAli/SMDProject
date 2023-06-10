// Import necessary modules
import React, { useEffect } from 'react';
import { Button, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';

const Firescreen = () => {
  
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    });

    return unsubscribe;
  }, []);

  const handleButtonClick = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      // get the FCM token
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('Your Firebase Token is:', fcmToken);
      } else {
        console.log('Failed', 'No token received');
      }
    }
  };

  return (
    <Button
      title="Press me for FCM!"
      onPress={handleButtonClick}
    />
  );
};

export default Firescreen;
