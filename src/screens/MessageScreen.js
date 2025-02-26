import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header'

const MessageScreen = ({ navigation }) => {
  const [ProfileImage, setProfileImage] = useState(null);

  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Carré
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };


  return (
   
        <Header>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
        </View>
        <Text style={styles.title}>Messagerie</Text>
      </View>
      </Header>
    
  );
};

const styles = StyleSheet.create({
//   background: {
//     flex: 1,
//     width: '100%',
//     height: '100%', // S'assure que l'image couvre tout l'écran
//     resizeMode: 'cover',
//   },
  title: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',

  }
 
});

export default MessageScreen;
