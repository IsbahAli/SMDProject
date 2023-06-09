import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import ImageCropPicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import { PROVIDER_GOOGLE } from 'react-native-maps';
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
  const [url,setUrl]=useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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
          (position:any) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error:any) => {
            console.log('Geolocation Error: ', error);
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

    if (!sellerName || !sellerId) {
      Alert.alert('Error', 'Seller name is missing. Please try again.');
      return;
    }

    const currentUser = auth().currentUser;
    if (currentUser) {
      const userId = currentUser.uid;
      const uploadPromises = images.map(async(image) => {
        const imageName = image.path.split('/').pop(); // Extract the image name from the path
        console.log('filepath',`images/${sellerId}/${imageName}`);
      const reference=storage().ref(`images/${sellerId}/${imageName}`);
        await reference.putFile(image.path)
        const url1 = await reference.getDownloadURL();
        console.log("urkl",url1);
        setUrl(url1);
      });
      
      
      Promise.all(uploadPromises)
        .then(() => {
          console.log("hdhd",url);
          const updatedItemData = {
            title: title,
    condition: condition,
    price: price,
    location: location,
    description: description,
    sellerName: sellerName,
    sellerId: sellerId,
            images: url,
          };
          //setItemData(updatedItemData)
          const newItemRef = database().ref(`users/${userId}/items`).push();
          const newItemKey = newItemRef.key;
          console.log("HI")
          console.log('Download URLs:', url);
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
                Alert.alert('Ad posted!');
                navigation.navigate('HomePg');
              })
              .catch((error: any) => {
                console.log('Firebase Error:', error);
                Alert.alert('Error', 'Failed to save data to Firebase.');
              });
                Alert.alert('Success', 'Item has been added successfully.');
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
  

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.heading}>Add Item</Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          onChangeText={(text) => setTitle(text)}
          value={title}
        />

        <TextInput
          style={styles.input}
          placeholder="Price"
          keyboardType="numeric"
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
        <View style={styles.mapContainer}>

    {latitude && longitude && (
      <MapView
      provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    )}
  </View>

        <Button title="Next" onPress={handleNext} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
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
    backgroundColor: 'blue',
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
    backgroundColor: 'blue',
    paddingVertical: 10,
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
    backgroundColor: 'blue',
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
    height: 200,
    marginTop: 20,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
});

export default AddItemPage;
