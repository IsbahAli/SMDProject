import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image, BackHandler, Alert, Modal, Pressable, ActivityIndicator } from 'react-native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

interface Ad {
  title: string;
  description: string;
  price: string;
  location: string;
  condition: string;
  images: string[];
  sellerName: string;
  sellerId:string;
}

const HomePage = ({ navigation }: any) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState('');
  const [userImage, setUserImage] = useState('');
  const [userIds, setUserId] = useState('');
  const [displayImage,setImageDis]=useState('');
  const [logoutConfirmationVisible, setLogoutConfirmationVisible] = useState(false);
  const [loading,setload]=useState(true);
  useEffect(() => {

    const backAction = () => {
      if (navigation.isFocused()) {
        showLogoutConfirmation();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setload(true);
        const adsRef = database().ref('ads');
        const snapshot = await adsRef.once('value');
        const adsData = snapshot.val();
        const adsArray = adsData ? Object.values(adsData) : [];
        setAds(adsArray as Ad[]);
        setload(false);
      } catch (error) {
        console.error('Error fetching ads', error);
      }
    };
  
    const fetchUserData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const userId = currentUser.uid;
          const userN = currentUser.displayName;
          setUserId(userId);
          setUserName(userN || '');
          const userRef = database().ref(`users/${userId}`);
          const snapshot = await userRef.once('value');
          const userData = snapshot.val();
          if (userData) {
            const { username, image } = userData;
            setUserName(currentUser.displayName || '');
            setUserImage(image);
            // setUserName(currentUser.displayName || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    const adsRef = database().ref('ads');
    const onAdsValueChange = (snapshot: any) => {
      const adsData = snapshot.val();
      const adsArray = adsData ? Object.values(adsData) : [];
      setAds(adsArray as Ad[]);
    };
    fetchAds();
    fetchUserData();
    adsRef.on('value', onAdsValueChange);
  
    return () => {
      adsRef.off('value', onAdsValueChange);
    };
  }, []);
  
  const handleAdPress = (ad: Ad) => {
    navigation.navigate('AdDetails', { ad, userid: userIds, username: userName });
  };
  
  const showLogoutConfirmation = () => {
    setLogoutConfirmationVisible(true);
  };

  const hideLogoutConfirmation = () => {
    setLogoutConfirmationVisible(false);
  };

  const handleConfirmLogout = () => {
    // Perform logout logic here
    hideLogoutConfirmation();
    navigation.navigate('LoginPg'); // or navigate to any other screen after logout
  };

  const handleCancelLogout = () => {
    hideLogoutConfirmation();
  };

  const filteredAds = ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {userImage ? <Image source={{ uri: userImage }} style={styles.userImage} /> : null}
        <Text style={styles.welcomeText}>Welcome, {userName}</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or description"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>


{loading?(<ActivityIndicator/>):(<View style={styles.container    }>
      {filteredAds.length > 0 ? (
        <ScrollView horizontal>
          <View style={styles.previewsContainer}>
            {filteredAds.map((ad, index) => {
              let adImages: string[] = [];

              if (typeof ad.images === 'string') {
                adImages = [ad.images];
              } else if (Array.isArray(ad.images)) {
                adImages = ad.images;
              }

              const displayImage = adImages.length > 0 ? adImages[0] : '';

              return (
                <TouchableOpacity key={index} style={styles.adPreview} onPress={() => handleAdPress(ad)}>
                  {ad.images && ad.images.length > 0 && <Image source={{ uri: displayImage }} style={styles.adImage} />}
                  <Text style={styles.adTitle}>{ad.title}</Text>
                  <Text style={styles.adDescription}>{ad.description}</Text>
                  <Text style={styles.adDescription}>PKR. {ad.price}</Text>
                  {/* Add other ad details as needed */}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noAdsContainer}>
          <Text style={styles.noAdsText}>No ads posted yet</Text>
        </View>
      )}</View>)}

      <Modal visible={logoutConfirmationVisible} transparent={true} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtonsContainer}>
              <Pressable style={styles.modalButton} onPress={handleCancelLogout}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalButton} onPress={handleConfirmLogout}>
                <Text style={styles.modalButtonText}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1cb48c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  searchBarContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  previewsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adPreview: {
    width: Dimensions.get('window').width / 2, // Adjust the width as needed
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  adImage: {
    width: '100%',
    height: 150, // Adjust the height as needed
    borderRadius: 5,
    marginBottom: 5,
  },
  adTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  adDescription: {
    fontSize: 16,
    color: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  sellerName: {
    fontSize: 14,
    color: 'gray',
    marginBottom: 5,
    textAlign: 'center',
  },
  noAdsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAdsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: '#1cb48c',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomePage;
