import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, Image, Modal, TouchableOpacity, Linking } from 'react-native';
import ImageCropPicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';
import PushNotification from 'react-native-push-notification';
import * as Permissions from 'react-native-permissions';
interface ItemData {
  title: string;
  condition: 'new' | 'used';
  price: string;
  location: string;
  description: string;
  images: string[]; // Update the type of images to string[]
  sellerName: string;
  sellerId: string;
};

const AddItemPage = ({ navigation }: any) => {
  const [images, setImages] = useState<CropPickerImage[]>([]);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>();
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<CropPickerImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [sellerName, setSellerName] = useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [latitude, setLatitude] = useState<number>(0.0);
  const [longitude, setLongitude] = useState<number>(0.0);
  const [linkUrl, setlinkUrl] = useState('');
  const [itemData, setItemData] = useState<ItemData>({
    title: '',
    condition: 'new',
    price: '',
    location: '',
    description: '',
    images: [], // Initialize images as an empty array
    sellerName: '',
    sellerId: '',
  });
  useEffect(() => {
    const fetchUserName = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUserName(currentUser.displayName || '');
        setSellerId(currentUser.uid || null);
        Geolocation.getCurrentPosition(
          async (position) => {
            const currentLongitude = position.coords.longitude;
            const currentLatitude = position.coords.latitude;
            setLatitude(currentLatitude);
            setLongitude(currentLongitude);

            const link = `https://www.google.com/maps/search/?api=1&query=${currentLatitude},${currentLongitude}`;
            setlinkUrl(link);
          },
          (error) => {
            if (error.code === 2) {
              Alert.alert(
                'Location Services Required',
                'Please enable location services (GPS) to use this feature. Press OK after you enable GPS.',
                [
                  {
                    text: 'OK',
                    onPress: () => fetchUserName(),
                  },
                ])

            }
            else
              console.warn(error.message);
          }
        );
      }
    };
    fetchUserName();
  }, []);


  useEffect(() => {
    if (userName) {
      updateSellerName(userName);
    }
  }, [userName]);



  const updateSellerName = (name: string) => {
    setSellerName(name);
    setIsLoading(false);
  };

  const handleNext = () => {
    if (isLoading) {
      Alert.alert('Please wait', 'User information is still loading. Please wait a moment.');
      return;
    }

    if (!title) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }

    if (!description) {
      Alert.alert('Error', 'Please enter a description.');
      return;
    }

    if (!condition) {
      Alert.alert('Error', 'Please select an item condition.');
      return;
    }

    if (!images || images.length === 0) {
      Alert.alert('Error', 'Please select at least one image.');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Location coordinates are missing. Please try again.');
      return;
    }
    if (!sellerName || !sellerId) {
      Alert.alert('Error', 'Seller name is missing. Please try again.');
      return;
    }

    const currentUser = auth().currentUser;
    if (currentUser) {
      const updatedItemData: ItemData = {
        title: title,
        condition: condition,
        price: price,
        location: `${latitude},${longitude}`,
        description: description,
        images: [], // Initialize images as an empty array
        sellerName: sellerName || '',
        sellerId: sellerId || '',
      };

      const userId = currentUser.uid;
      const uploadPromises = images.map(async (image) => {
        const imageName = image.path.split('/').pop(); // Extract the image name from the path
        console.log('filepath', `images/${sellerId}/${imageName}`);
        const reference = storage().ref(`images/${sellerId}/${imageName}`);
        await reference.putFile(image.path)
        const url1 = await reference.getDownloadURL();
        console.log("urkl", url1);
        updatedItemData.images.push(url1);
      });


      Promise.all(uploadPromises)
        .then(() => {
          console.log(updatedItemData)
          //setItemData(updatedItemData)
          const newItemRef = database().ref(`users/${userId}/items`).push();
          const newItemKey = newItemRef.key;
          if (newItemKey) {
            newItemRef
              .set(updatedItemData)
              .then(() => {
                database()
                  .ref('ads')
                  .child(newItemKey)
                  .set(updatedItemData)
                  .then(() => {
                    setTitle('');
                    setCondition(undefined);
                    setPrice('');
                    setLocation('');
                    setDescription('');
                    setImages([]);
                    setSelectedImage(null);
                    setModalVisible(false);
                  })
                  .catch((error: any) => {
                    console.log('Firebase Error:', error);
                    Alert.alert('Error', 'Failed to save data to Firebase.');
                  });
                messaging()
                  .getToken()
                  .then(token => {
                    sendNotification(token, "Ad Posted!", "Your ad has been posted successfully.");
                  });

                navigation.goBack();
              })
              .catch((error: any) => {
                console.log('Firebase Error:', error);
                Alert.alert('Error', 'Failed to save data to Firebase.');
              });
          } else {
            Alert.alert('Error', 'Failed to generate item key.');
          }
        })
        .catch((error) => {
          console.log('Upload Promises:', url);
          console.log('Firebase Storage Error:', error);
          Alert.alert('Error', 'Failed to upload images to Firebase Storage.');
        });
    } else {
      Alert.alert('Error', 'User not logged in. Please log in to continue.');
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

  const handleImageUpload = () => {
    const totalImages = images.length;
    const remainingSlots = 20 - totalImages;

    if (remainingSlots === 0) {
      Alert.alert('Error', 'You have reached the maximum limit of 20 images.');
      return;
    }

    const maxSelection = remainingSlots > 5 ? 5 : remainingSlots;
    ImageCropPicker.openPicker({
      multiple: true,
      mediaType: 'photo',
      cropping: true,
      maxFiles: maxSelection,
    })
      .then((response: CropPickerImage[]) => {
        console.log("response",response);
        setImages((prevImages: CropPickerImage[]) => [...prevImages, ...response]);
      })
      .catch((error) => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const renderSelectedImages = () => {
    return images.map((image, index) => (

      <View key={index} style={styles.selectedImageContainer}>
        <TouchableOpacity
          onPress={() => {
            setSelectedImage(image);
            setModalVisible(true);
          }}
        >
          <Image source={{ uri: image.path }} style={styles.selectedImage} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.removeImageButton}
          onPress={() => handleImageRemove(index)}
        >
          <Text style={styles.removeImageButtonText}>Remove</Text>
        </TouchableOpacity>
      </View>
    ));
  };

  const handleImageRemove = (index: number) => {
    setImages((prevImages: CropPickerImage[]) => {
      const updatedImages = [...prevImages];
      updatedImages.splice(index, 1);
      return updatedImages;
    });
  };

  // Configure the library
  PushNotification.configure({
    onNotification: function (notification) {
      console.log('Notification received:', notification);
      // Add your logic to handle the notification here
    },
  });
  const sendNotification = async (token: any, title: string, body: string) => {
    try {
      const serverKey =
        "AAAAN3cVBRQ:APA91bF-rhabDplVtrvLjgpkNpJ-43fI8CBsdB_FVCzvg0NEPhr-zWB9a7Ns1aThchK7P9FBuT8QiZwGpTL15S7h2OiW1bLVdJ0kMR1wXmMh0AhPD7kP9U8Cr_btpR7bJOdVDl1DdtwQ";
      const message = {
        to: token,
        notification: {
          title: title,
          body: body,
        },
      };

      await axios.post("https://fcm.googleapis.com/fcm/send", message, {
        headers: {
          Authorization: `key=${serverKey}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Notification sent successfully");
      PushNotification.configure({
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
      })
      PushNotification.localNotification({
        title: title,
        message: body,
        vibrate: true,
        vibration: 300


      });
    } catch (error) {
      console.log("Error sending notification:", error);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#1cb48c' }}>
      <View style={styles.container}>
        <Text style={styles.heading}>Add Item</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="white"
          onChangeText={(text) => setTitle(text)}
          value={title}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
          placeholderTextColor="white"
          onChangeText={(text) => setPrice(text)}
          value={price}
        />

        <View style={styles.conditionContainer}>
          <Text style={styles.label}>Condition:</Text>
          <View style={styles.conditionButtonsContainer}>
            <TouchableOpacity
              style={[styles.conditionButton, condition === 'new' && styles.selectedConditionButton]}
              onPress={() => setCondition('new')}
            >
              <Text style={styles.conditionButtonText}>New</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.conditionButton, condition === 'used' && styles.selectedConditionButton]}
              onPress={() => setCondition('used')}
            >
              <Text style={styles.conditionButtonText}>Used</Text>
            </TouchableOpacity>
          </View>
        </View>


        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="white"
          onChangeText={(text) => setDescription(text)}
          value={description}
          multiline
        />

        <View style={styles.uploadContainer}>
          <Text style={styles.label}>Upload Images:</Text>
          <TouchableOpacity style={styles.uploadButton} onPress={handleImageUpload}>
            <Text style={styles.uploadButtonText}>Select Images</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.selectedImagesContainer}>{renderSelectedImages()}</View>

        <Modal animationType="slide" transparent={false} visible={modalVisible}>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage?.path }} style={styles.modalImage} />

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setSelectedImage(null);
                setModalVisible(false);
              }}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Text style={styles.label}>Location:</Text>
        <TextInput
          style={styles.input}
          placeholder="Area"
          placeholderTextColor="white"
          onChangeText={(text) => setLocation(text)}
          value={location}
          multiline
        />
        {/* <Text onPress={openMap} style={styles.input1}>{linkUrl}</Text> */}
        {/* <ScrollView>
        <View style={styles.mapContainer}>
      <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={{
        latitude: latitude || 0,
        longitude: longitude || 0,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
    >
      <Marker coordinate={{ latitude, longitude }} />
    </MapView>
    
    
  </View>
  </ScrollView> */}

        <TouchableOpacity
          style={[styles.button]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1cb48c', // Set background color
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white'
  },

  input1: {
    height: 80,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#1cb48c', // Set input background color
    color: 'white',
    textDecorationLine: 'underline',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#1cb48c', // Set input background color
    color: 'white',
    marginBottom: 20,
  },
  conditionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,

  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: "white"
  },
  conditionButtonsContainer: {
    flexDirection: 'row',
  },
  conditionButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  selectedConditionButton: {
    backgroundColor: 'white',
  },
  conditionButtonText: {
    fontSize: 16,
    color: '#555',
  },
  uploadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,

  },
  uploadButton: {
    backgroundColor: '#1cb48c',
    paddingVertical: 10,
    borderColor: 'white',
    borderWidth: 1,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  selectedImage: {
    width: 100,
    height: 100,
    marginRight: 10,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#1cb48c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedImageContainer: {
    position: 'relative',
    marginRight: 10,
    marginBottom: 10,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 4,
  },
  removeImageButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    height: "50%",
    width: "50%"
  },
  button: {
    width: '70%',
    height: 50,
    backgroundColor: 'white', // Set button background color
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 1,
    alignSelf: 'center'
  },
  buttonText: {
    color: '#1cb48c',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddItemPage;
