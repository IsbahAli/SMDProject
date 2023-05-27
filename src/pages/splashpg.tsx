import React, { useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';


const SplashPage = ({ navigation }:any) => {
  // Define navigation to the next screen after the splash screen
  const navigateTo = 'LoginPg';

  useEffect(() => {
    setTimeout(() => {
      // Navigate to the next screen after the splash screen
      navigation.replace(navigateTo);
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Image source={{uri:'https://karachithriftstore.com/wp-content/uploads/2023/03/cropped-KTS-logo.jpeg'}} style={styles.logo} />
      <Text style={styles.title}>Shop smarter, save better!</Text>
      <Text style={styles.subtitle}>Making your life better!</Text>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1cb48c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    resizeMode: 'contain',
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 30,
  },
  subtitle: {
    color: 'white',
    fontSize: 20,
    marginTop: 10,
  },
});
export default SplashPage