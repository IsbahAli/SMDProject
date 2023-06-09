import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';

interface Ad {
  title: string;
  description: string;
  price: string;
  location: string;
  condition: string;
  images: string[]; // Array of image URLs
  // Add other ad properties as needed
}

const MyAdsPage = ({navigation}:any) => {
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const userId = currentUser.uid;
      const userAdsRef = database().ref(`users/${userId}/items`);
      userAdsRef.once('value').then((snapshot) => {
        const userAdsData = snapshot.val();
        const userAdsArray = userAdsData ? Object.values(userAdsData) : [];
        setUserAds(userAdsArray as Ad[]);
      });
    }
  }, []);

  const handleAdPress = (ad: Ad) => {
    navigation.navigate('AdDetails', { ad });
  };

  const filteredAds = userAds.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or description"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1cb48c',
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
  },
  adDescription: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default MyAdsPage;
