import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
// import {
//   checkNotifications,
//   requestNotifications,
// } from 'react-native-permissions';

export const FirebaseNotificationInit = () => {
  // if (Platform.OS == 'ios')
  //   checkNotifications().then(({status, settings}) => {
  //     console.log('check: ', {status}, {settings});
  //     if (status == 'denied') {
  //       requestNotifications(['alert', 'sound']).then(({status, settings}) => {
  //         console.log('request: ', {status}, {settings});
  //         if (state == 'granted') mapFirebaseEvents();
  //       });
  //     } else if (status == 'granted') mapFirebaseEvents();
  //   });
  // else {
  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  mapFirebaseEvents();
};

const mapFirebaseEvents = () => {
  try {
    // Register background state app open handler
    messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.notification,
        );

        processNotification(remoteMessage);
      }
    });

    // Register quit state app open handler
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );

          processNotification(remoteMessage);
        }
      });

    // Register foreground handler
    messaging().onMessage(async remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );

        processNotification(remoteMessage);
      }
    });

    // Register background handler
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      processNotification(remoteMessage);
    });

    // Get the device token
    messaging()
      .getToken()
      .then(token => {
        // Save data to API/DB
        //firebaseService.saveUserFireBaseTokenToDatabase(token);
      });

    messaging().onTokenRefresh(token => {
      // Save data to API/DB
      // firebaseService.saveUserFireBaseTokenToDatabase(token);
    });
  } catch (error) {
    console.log('Firebase loading error: ', error);
  }
};

const processNotification = (messageReceived:any) => {
  console.log('trigger called: ', messageReceived);

  // dispatch counter refresh
  // refreshNotifyCounter();
    const dataObj = messageReceived.data;
    // Extract the body from the message data
    const body = dataObj.body;
    // Perform actions based on the message body
    if (body === 'Come, check out new posts that you have missed.') {
      // Handle the case when a new ad is posted
      
      // Do something specific for new ad posted notification
    } else if (body === 'There is nothing wrong in spending sometime with us being thrifty') {
      // Handle another type of notification
      console.log('Another type of notification');
      // Do something specific for this type of notification
    } else {
      // Handle other cases or default actions
      console.log('Default notification handling');
      // Do something as a default action
    }
  };

const takeActionOnNotification = (noticeData: any) => {
  if (noticeData) {
    switch (noticeData.Type) {
      case 1:
        // do something
        break;

      case 2:
        // do something
        break;
    }
  }
};
