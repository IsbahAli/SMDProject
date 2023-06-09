import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Image, Alert, TextInput, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Swiper from 'react-native-swiper';

const AdDetailsPage = ({ navigation, route }: any) => {
  const { ad, userid, username } = route.params;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [bidPrice, setBidPrice] = useState('');
  const [location, setLocation] = useState<string>(ad.location);
  const [linkUrl, setLinkUrl] = useState('');
  const [isLoading,setLoading]=useState(false);
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setModalVisible(true);
  };
  const [latitude, longitude] = location.split(',');
  useEffect(() => {
    
    const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    setLinkUrl(link);
  }, []);
  const handleChat = () => {
    const minBidPrice = 0.6 * parseInt(ad.price); // Calculate 40% of ad price

    if (parseInt(bidPrice) >= minBidPrice && ad.sellerId !== userid) {
      const chatData = {
        receiverId: userid,
        senderId: ad.sellerId,
        senderName: ad.sellerName,
        receiverName: username,
      };

      const bidMessage = `Bid Price: ${bidPrice} for ${ad.title}`;
      navigation.navigate('ChatScreen', { chatData: chatData, bidMsg: bidMessage });
    } else {
      Alert.alert(
        'Invalid Bid',
        `Bid price should be at least ${minBidPrice}`,
        [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
      );
    }
  };

  
  const mapUrl = `geo:${latitude},${longitude}`;
  const openMap = () => {
    Linking.canOpenURL(mapUrl)
      .then((supported) => {
        if (!supported) {
          console.log("Map navigation is not supported on this device.");
        } else {
          return Linking.openURL(mapUrl);
        }
      })
      .catch((error) => console.log(error));
  };


  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Swiper loop={false} showsPagination={false} index={selectedImageIndex}>
          {(Array.isArray(ad.images) ? ad.images : [ad.images]).map((image: string, index: number) => (
              <>
              <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
              <Text>{image}</Text>
              </>
                
           
          ))}
        </Swiper>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.description}>{ad.description}</Text>
        <Text style={styles.details}>Price: {ad.price}</Text>
        <View style={styles.mapContainer}>
          <Text style={styles.details}>Location:</Text>
          <Text  style={styles.details1}>{ad.location}</Text>
          {/* <MapView
            style={styles.map}
            initialRegion={{
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
          >
            <Marker
              coordinate={{
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
              }}
            />
          </MapView> */}
        </View>
        <Text style={styles.details}>Condition: {ad.condition}</Text>
        <Text style={styles.details}>Seller: {ad.sellerName}</Text>
      </View>

      {selectedImageIndex !== null && (
        <Modal animationType="slide" visible={modalVisible}>
          <View style={styles.modalContainer}>
            <Swiper loop={false} showsPagination={false} index={selectedImageIndex}>
              {(Array.isArray(ad.images) ? ad.images : [ad.images]).map((image: string, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImageClick(index)}
                  style={styles.swiperSlide}
                >
                  <Image source={{ uri: image }} style={styles.modalImage} resizeMode="contain" />
                </TouchableOpacity>
              ))}
            </Swiper>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {ad.sellerId !== userid && (
        <View style={styles.bidContainer}>
          <TextInput
            style={styles.bidInput}
            placeholder="Enter your bid price"
            onChangeText={(text) => setBidPrice(text)}
            value={bidPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={handleChat} style={styles.bidButton}>
            <Text style={styles.bidButtonText}>Bid</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1cb48c',
  },
  imageContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },

  details1: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: 'center',
  },
  details: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: 'center',
  },
  button: {
    width: '50%',
    height: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1cb48c',
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  swiperSlide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButton: {
    backgroundColor: '#1cb48c',
    paddingVertical: 16,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bidContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bidInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  bidButton: {
    backgroundColor: '#1cb48c',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    borderColor : 'white',
    borderWidth: 1,
  },
  bidButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  mapContainer: {
    flex: 1,
    backgroundColor: 'white'
  },
  map: {
    height: "100%",
    width: "100%"
  },
});

export default AdDetailsPage;
