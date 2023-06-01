import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity, Alert, PermissionsAndroid } from 'react-native';
import auth from '@react-native-firebase/auth';
import { launchImageLibrary, launchCamera, ImagePickerResponse, Asset } from 'react-native-image-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import storage from '@react-native-firebase/storage';

const ProfilePage = () => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);

  useEffect(() => {
    const user = auth().currentUser;
    if (user) {
      setUserName(user.displayName || '');
      setEmail(user.email || '');
      setProfileImage(user.photoURL || '');
    }
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
          buttonPositive: 'OK',
          buttonNegative: 'Cancel',
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Camera permission granted, proceed with capturing image
        setCameraPermissionGranted(true);
        captureProfileImage();
      } else {
        // Camera permission denied
        console.log('Camera permission denied');
      }
    } catch (error) {
      console.log('Error requesting camera permission:', error);
    }
  };

  const handleImagePickerResponse = async (response: ImagePickerResponse) => {
    if (!response.didCancel && !response.errorMessage) {
      const asset: Asset | undefined = response.assets && response.assets[0];
      if (asset) {
        setProfileImage(asset.uri || '');
        await uploadProfileImage(asset.uri || '');
      }
    }
  };

  const captureProfileImage = () => {
    launchCamera({ mediaType: 'photo' }, handleImagePickerResponse);
  };

  const uploadProfileImage = async (uri: string) => {
    const user = auth().currentUser;
    if (user) {
      const imageRef = storage().ref(`profileImages/${user.uid}`);
      try {
        await imageRef.putFile(uri);
        const downloadURL = await imageRef.getDownloadURL();
        await user.updateProfile({
          photoURL: downloadURL,
        });
        console.log('Profile image uploaded successfully');
        // You can display the updated profile image here if needed
        // setProfileImage(downloadURL);
      } catch (error) {
        console.log('Error uploading profile image:', error);
        Alert.alert('Error', 'Failed to upload profile image. Please try again.');
      }
    }
  };

  const updateProfile = () => {
    const user = auth().currentUser;
    if (user) {
      // Update display name
      user
        .updateProfile({
          displayName: userName,
        })
        .then(() => {
          console.log('Profile updated successfully');
          Alert.alert('Profile Updated', 'Your profile has been updated successfully');
        })
        .catch((error) => {
          console.log('Error updating profile:', error);
          Alert.alert('Error', 'Failed to update profile. Please try again.');
        });

      // Update email if it has been changed
      if (email !== user.email) {
        user
          .updateEmail(email)
          .then(() => {
            console.log('Email updated successfully');
          })
          .catch((error) => {
            console.log('Error updating email:', error);
            Alert.alert('Error', 'Failed to update email. Please try again.');
          });
      }

      // Update password if it has been changed
      if (newPassword !== '' && newPassword === confirmPassword) {
        const credential = auth.EmailAuthProvider.credential(user.email || '', oldPassword);
        user
          .reauthenticateWithCredential(credential)
          .then(() => {
            user
              .updatePassword(newPassword)
              .then(() => {
                console.log('Password updated successfully');
              })
              .catch((error) => {
                console.log('Error updating password:', error);
                Alert.alert('Error', 'Failed to update password. Please try again.');
              });
          })
          .catch((error) => {
            console.log('Error reauthenticating:', error);
            Alert.alert('Error', 'Failed to update password. Please verify your old password.');
          });
      }
    }
  };

  const selectProfileImage = async () => {
    if (cameraPermissionGranted) {
      captureProfileImage();
    } else {
      Alert.alert(
        'Select Image',
        'Choose an option to set your profile image',
        [
          {
            text: 'Camera',
            onPress: () => requestCameraPermission(),
          },
          {
            text: 'Choose from Photos',
            onPress: () => launchImageLibrary({ mediaType: 'photo' }, handleImagePickerResponse),
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        {profileImage ? (
          <TouchableOpacity onPress={selectProfileImage}>
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={selectProfileImage}>
            <MaterialIcon name="account-circle" size={150} color="#D3D3D3" />
            <MaterialIcon name="edit" size={30} color="#D3D3D3" style={styles.editIcon} />
          </TouchableOpacity>
        )}
        <Text style={styles.username}>{userName}</Text>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={userName}
          onChangeText={(text) => setUserName(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Old Password"
          placeholderTextColor="white"
          secureTextEntry
          value={oldPassword}
          onChangeText={(text) => setOldPassword(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New Password"
          placeholderTextColor="white"
          secureTextEntry
          value={newPassword}
          onChangeText={(text) => setNewPassword(text)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="white"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
      </View>
      <TouchableOpacity style={styles.buttonContainer} onPress={updateProfile}>
        <Text style={styles.buttonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1cb48c', // Set background color
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  editIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'white',
  },
  inputContainer: {
    width: '70%',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#1cb48c', // Set input background color
    color: 'white',
  },
  buttonContainer: {
    width: '70%',
    height: 50,
    backgroundColor: 'white', // Set button background color
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'gray',
    borderWidth: 1,
  },
  buttonText: {
    color: '#1cb48c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfilePage;
