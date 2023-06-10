import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert, Image, Dimensions } from 'react-native';
import auth from '@react-native-firebase/auth';

const MainProfilePage = ({ navigation }: any) => {
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleConfirmLogout = () => {
    auth()
      .signOut()
      .then(() => {
        
        navigation.navigate('LoginPg');
      })
      .catch((error) => {
        console.log(error);
        Alert.alert(error);
      });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };
  
  return (
    <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity>
            <Image source={{ uri: "https://karachithriftstore.com/wp-content/uploads/2023/03/cropped-KTS-logo.jpeg" }} style={styles.logo} />
          </TouchableOpacity>
          </View>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyAds')}>
        <Text style={styles.buttonText}>My Ads</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.button}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      {showLogoutConfirmation && (
        <View style={styles.logoutConfirmation}>
          <Text style={styles.logoutConfirmationText}>Are you sure you want to logout?</Text>
          <View style={styles.logoutConfirmationButtonsContainer}>
            <TouchableOpacity style={styles.logoutConfirmationButton} onPress={handleCancelLogout}>
              <Text style={styles.logoutConfirmationButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutConfirmationButton} onPress={handleConfirmLogout}>
              <Text style={styles.logoutConfirmationButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1cb48c',
    padding: 16,
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
    
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  button: {
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 1,
    width: '70%',
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:'center',
  },
  logoutConfirmation: {
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutConfirmationText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  logoutConfirmationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  logoutConfirmationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1cb48c',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  logoutConfirmationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default MainProfilePage;
