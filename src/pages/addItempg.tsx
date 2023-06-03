import React, { useState,useEffect } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import ImageCropPicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const AddItemPage = ({ navigation }:any) => {
  const [images, setImages] = useState<CropPickerImage[]>([]);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>();
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<CropPickerImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [sellerName,setSellerName] =useState<string | null>(null);
  const [sellerId, setSellerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchUserName = async () => {
      const currentUser = auth().currentUser;
      if (currentUser) {
        setUserName(currentUser.displayName || '');
        setSellerId(currentUser.uid || null);
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
    // Check if the userName is still loading
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

      const itemData = {
        title,
        condition,
        price,
        location,
        description,
        images: images.map((image) => image.path),
        sellerName,
        sellerId,
      };

      const newItemRef = database().ref(`users/${userId}/items`).push();
      const newItemKey = newItemRef.key;

      if (newItemKey) {
        newItemRef
          .set(itemData)
          .then(() => {
            database()
              .ref('ads')
              .child(newItemKey)
              .set(itemData)
              .then(() => {
                setTitle('');
                setCondition(undefined);
                setPrice('');
                setLocation('');
                setDescription('');
                setImages([]);
                setSelectedImage(null);
                setModalVisible(false);
                setSellerName('');
                Alert.alert('Ad posted!');
                navigation.navigate('HomePg');
              })
              .catch((error: any) => {
                console.log('Firebase Error:', error);
                Alert.alert('Error', 'Failed to save data to Firebase.');
              });
          })
          .catch((error: any) => {
            console.log('Firebase Error:', error);
            Alert.alert('Error', 'Failed to save data to Firebase.');
          });
      } else {
        Alert.alert('Error', 'Failed to generate item key.');
      }
    } else {
      Alert.alert('Error', 'User not logged in.');
    }
  };
  const handleImageUpload = () => {
    const remainingSlots = 20 - images.length;

    if (remainingSlots <= 0) {
      Alert.alert('Error', 'You have reached the maximum limit of 20 images.');
      return;
    }

    const maxFiles = remainingSlots < 5 ? remainingSlots : 5; // Limit to 5 files if remaining slots are less than 5

    ImageCropPicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      cropping: true,
      cropperToolbarTitle: 'Crop Image',
      includeBase64: true,
      maxFiles: maxFiles,
    })
      .then((response: CropPickerImage[]) => {
        if (response && response.length > 0) {
          if (images.length + response.length > 20) {
            Alert.alert('Error', 'You can select up to 20 images in total.');
            return;
          }
          setImages((prevImages: CropPickerImage[]) => [...prevImages, ...response]);
        }
      })
      .catch((error) => {
        console.log('ImagePicker Error: ', error);
      });
  };

  const handleConditionSelection = (selectedCondition: 'new' | 'used') => {
    setCondition(selectedCondition);
  };

  const handleLocationSelection = (selectedLocation: string) => {
    setLocation(selectedLocation);
  };
  const handleImageClick = (image: CropPickerImage) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const handleImageRemove = (image: CropPickerImage) => {
    Alert.alert('Confirmation', 'Are you sure you want to delete this image?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const updatedImages = images.filter((img) => img.path !== image.path);
          setImages(updatedImages);
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>Add Images (up to 20)</Text>
      <TouchableOpacity onPress={handleImageUpload} style={styles.button}>
        <Text style={styles.buttonText}>Select Images</Text>
      </TouchableOpacity>

      {images.length > 0 && (
        <View>
          <Text style={styles.text}>Selected Images:</Text>
          <View style={styles.imagesContainer}>
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleImageClick(image)}
                onLongPress={() => handleImageRemove(image)}
              >
                <Image source={{ uri: image.path }} style={styles.image} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.text}>Add Price</Text>
      <TextInput
        value={price}
        onChangeText={(text) => setPrice(text)}
        placeholder="Enter price"
        style={styles.input}
      />

      <Text style={styles.text}>Item Condition</Text>
      <View style={styles.conditionButtonsContainer}>
        <TouchableOpacity
          onPress={() => handleConditionSelection('new')}
          style={[styles.button, condition === 'new' && styles.buttonSelected]}
        >
          <Text style={styles.buttonText}>New</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleConditionSelection('used')}
          style={[styles.button, condition === 'used' && styles.buttonSelected]}
        >
          <Text style={styles.buttonText}>Used</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.text}>Choose Location</Text>
      <TextInput
        value={location}
        onChangeText={handleLocationSelection}
        placeholder="Enter location"
        style={styles.input}
      />

      <Text style={styles.text}>Title</Text>
      <TextInput
        value={title}
        onChangeText={(text) => setTitle(text)}
        placeholder="Enter title"
        style={styles.input}
      />

      <Text style={styles.text}>Description</Text>
      <TextInput
        value={description}
        onChangeText={(text) => setDescription(text)}
        placeholder="Enter description"
        style={styles.input}
      />

      <TouchableOpacity onPress={handleNext} style={styles.button}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>

      {selectedImage && (
        <Modal animationType="slide" visible={modalVisible}>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage.path }} style={styles.modalImage} />

            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: '#1cb48c',
    paddingVertical: 20,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: 'white',
  },
  input: {
    width: '70%',
    height: 40,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
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
  conditionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 10,
  },
  buttonSelected: {
    backgroundColor: 'green',
    borderColor:'gray',
    borderWidth: 1,

  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
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
});

export default AddItemPage;
