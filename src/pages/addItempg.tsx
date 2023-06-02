import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, ScrollView, Image, Modal, TouchableOpacity } from 'react-native';
import ImageCropPicker, { Image as CropPickerImage } from 'react-native-image-crop-picker';

const AddItemPage = () => {
  const [images, setImages] = useState<CropPickerImage[]>([]);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'new' | 'used'>();
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<CropPickerImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const handleNext = () => {
    if (!title) {
      Alert.alert('Error', 'Please enter a title.');
      return;
    }

    if (!condition) {
      Alert.alert('Error', 'Please select an item condition.');
      return;
    }

    // Proceed with the next button logic here
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
      <Button title="Select Images" onPress={handleImageUpload} />

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

      {/* <Text style={styles.text}>Choose Location</Text>
      <RNPickerSelect
        value={location}
        onValueChange={handleLocationSelection}
        placeholder={{ label: 'Select location', value: null }}
        items={[
          { label: 'Location 1', value: 'location1' },
          { label: 'Location 2', value: 'location2' },
          { label: 'Location 3', value: 'location3' },
          // Add more locations
        ]}
      /> */}

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

      <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
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
    height: 50,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#1cb48c',
    color: 'white',
    marginBottom: 20,
  },
  conditionButtonsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
  },
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'black',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  button: {
    width: '45%',
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
  buttonSelected: {
    backgroundColor: '#006600',
  }
});

export default AddItemPage;
