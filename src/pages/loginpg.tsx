import { useEffect, useState } from 'react';
import MatIcons from 'react-native-vector-icons/MaterialIcons';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';


const LoginPage = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const IsFocused=useIsFocused()
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [errortext, setErrortext] = useState("");

  const [user, setUser] = useState(null);

  function onAuthStateChanged(user: any) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

const setShoredValue= async ()=>{
 AsyncStorage.getItem('email').then((res)=>{
  const newString=res||""
    setEmail(newString)
  })
 AsyncStorage.getItem('password').then((res)=>{
  const newString=res||""
  setPassword(newString)
 })
  
}



useEffect(()=>{
  setShoredValue()
},[])


  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged)
    return subscriber;
  }, [navigation,IsFocused]);

  if (initializing) return null;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin =  async () => {
    console.log(email, " ", password);
    if(email&&password){
    AsyncStorage.setItem("email",email)
    AsyncStorage.setItem("password",password)

    }
    
    
    setErrortext("");
    if (!email) {
      Alert.alert("Please fill Email");
      return;
    }
    if (!password) {
      Alert.alert("Please fill Password");
      return;
    }
    auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        if (user) {
          setEmail("");
          setPassword("");
          setShowPassword(false);
          setErrortext("");
          navigation.navigate("HomePg", { email });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.code === "auth/invalid-email") {
          setErrortext(error.message);
          Alert.alert("Invalid Email", error.message);
        } else if (error.code === "auth/user-not-found") {
          setErrortext("No User Found");
          Alert.alert("User Not Found", "No user with this email exists");
        } else {
          setErrortext("Please check your email id or password");
          Alert.alert("Login Error", "Please check your email and password");
        }
      });
  };

  const handleSignUp = () => {
    navigation.navigate('SignUpPg', { email });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome Back</Text>
      <TouchableOpacity>
        <View style={[styles.inputContainer, { marginTop: 20 }]}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="white"
            value={email}
            onChangeText={(email) => setEmail(email)}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="white"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={(password) => setPassword(password)}
          />
          <MatIcons
            name={showPassword ? 'visibility-off' : 'visibility'}
            size={24}
            color="white"
            onPress={togglePasswordVisibility}
            style={styles.icon}
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity  onPress={handleLogin}  style={styles.buttonContainer}>
        
          <Text style={styles.input1}>Login</Text>
        
      </TouchableOpacity>
      <Text style={styles.text1}>Don't have an account?</Text>
      <View>
        <TouchableOpacity onPress={handleSignUp}>
          <Text style={styles.text2}>Sign Up for FREE!</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'white'
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20
  },
  text1: {
    color: 'white',
    fontSize: 14
  },
  text2: {
    color: 'white',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  showPasswordButton: {
    padding: 5,
  },
  icon: {
    marginRight: 10,
  },
});

export default LoginPage;