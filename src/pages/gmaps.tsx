import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useState } from 'react';
import { Linking, Text, View } from 'react-native';

const GMap = () => {
    const [latitude, setLatitude] = useState<number>(0.0);
  const [longitude, setLongitude] = useState<number>(0.0);
    useEffect(() => {
            Geolocation.getCurrentPosition(
              (position) => {
                
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                
              },
              (error) => {
                
                console.warn(error);
              }
            );
            })
    
 
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
    <View>
      <Text>Location:</Text>
      <Text onPress={openMap}>Open Map</Text>
    </View>
  );
};

export default GMap;
