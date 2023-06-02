import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

// Import your existing UpdateProfile and Logout components
import ProfilePage from './profilepg';

const MainProfilePage = ({ navigation }:any) => {
    const handleLogout = () => {
        Alert.alert(
          'Logout',
          'Are you sure you want to logout?',
          [
            {
              text: 'Cancel',
              onPress: () => {
                return null;
              },
            },
            {
              text: 'Confirm',
              onPress: () => {
                auth()
                  .signOut()
                  .then(() => {
                    navigation.navigate('LoginPg');
                  })
                  .catch((error) => {
                    console.log(error);
                    Alert.alert(error);
                  });
              },
            },
          ],
          { cancelable: false }
        );
      };
    
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <View style={styles.container}>
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1cb48c', // Set background color  
    padding:16,
},
  button: {
    backgroundColor: '#1cb48c',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'gray',
    padding:10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MainProfilePage;
