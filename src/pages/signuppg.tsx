import React, { useState, createRef } from 'react';
import MatIcons from 'react-native-vector-icons/MaterialIcons';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import auth from '@react-native-firebase/auth';

const SignUpPage = ({ navigation, route }: any) => {
  const [email, setEmail] = useState(route.params?.email || '');
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [showPassword1, setShowPassword1] = useState(false);
  const emailInputRef = createRef<TextInput>();
  const passwordInputRef = createRef<TextInput>();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const togglePasswordVisibility1 = () => {
    setShowPassword1(!showPassword1);
  };
  const handleSignUp = () => {
    setErrortext('');

    if (!userName) {
      Alert.alert('Please fill Name');
      return;
    }
    if (!email) {
      Alert.alert('Please fill Email');
      return;
    }
    if (!isEmailValid(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }
    if (!password) {
      Alert.alert('Please fill Password');
      return;
    }
    if (!isPasswordValid(password)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain a special character'
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords entered do not match');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('Registration Successful. Please Login to proceed');

        // Update user's display name
        user
          .updateProfile({
            displayName: userName,
          })
          .then(() => {
            console.log('User profile updated successfully');
          })
          .catch((error) => {
            console.log('Error updating user profile:', error);
          });

        navigation.navigate('LoginPg');
        console.log(user);
      })
      .catch((error) => {
        console.log(error);
        if (error.code === 'auth/email-already-in-use') {
          setErrortext('That email address is already in use!');
          Alert.alert('Email Already in Use', 'Please use a different email address');
        } else {
          setErrortext(error.message);
          Alert.alert('Signup Error', error.message);
        }
      });
  };

  const isEmailValid = (email: string) => {
    // Simple email validation regex pattern
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  const isPasswordValid = (password: string) => {
    // Password validation regex pattern
    // At least 8 characters and contains a special character
    const passwordPattern = /^(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordPattern.test(password);
  };

  const handlePasswordChange = (password: string) => {
    setPassword(password);
  };

  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setConfirmPassword(confirmPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome</Text>
      <View style={[styles.inputContainer, { marginTop: 20 }]}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="white"
          value={userName}
          onChangeText={(username) => setUserName(username)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={email}
          onChangeText={(email) => setEmail(email)}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry={!showPassword}
          onChangeText={handlePasswordChange}
        />
        <MatIcons
          name={showPassword ? 'visibility-off' : 'visibility'}
          size={24}
          color="white"
          onPress={togglePasswordVisibility}
          style={styles.icon}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="white"
          secureTextEntry={!showPassword1}
          onChangeText={handleConfirmPasswordChange}
        />
        <MatIcons
          name={showPassword1 ? 'visibility-off' : 'visibility'}
          size={24}
          color="white"
          onPress={togglePasswordVisibility1}
          style={styles.icon}
        />
      </View>
      {errortext !== '' && <Text style={styles.errorTextStyle}>{errortext}</Text>}
      <TouchableOpacity style={styles.buttonContainer} onPress={handleSignUp}>
        <Text style={styles.input1}>Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1cb48c',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer: {
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 1,
    width: '70%',
    height: 45,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    height: 50,
    flex: 1,
    padding: 10,
    color: 'white',
  },
  input1: {
    height: 50,
    flex: 1,
    padding: 10,
    color: '#1cb48c',
    fontWeight: 'bold',
    fontSize: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    width: '70%',
    height: 50,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  errorTextStyle: {
    color: 'red',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  icon: {
    marginRight: 10,
  },
});

export default SignUpPage;
