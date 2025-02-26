import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const ProfileScreen = ({ navigation }) => {
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

  const handleProfileImagePress = () => {
    Alert.alert(
      'Changer de photo de profil',
      '',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Changer', onPress: handleChoosePhoto },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')} // Chemin vers l'image de fond
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleProfileImagePress} style={styles.touchable}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addPhotoText}>Changer de photo</Text>
            )}
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Votre Nom</Text>

    {/* Bouton Mes services */}
    <TouchableOpacity style={styles.button} activeOpacity={0.8}>
      <Text style={styles.textButton}>Mes services</Text>
    </TouchableOpacity>

    {/* Bouton Mes sorties */}
    <TouchableOpacity style={styles.button} activeOpacity={0.8}>
      <Text style={styles.textButton}>Mes sorties</Text>
    </TouchableOpacity>

    {/* Bouton Mes infos */}
    <TouchableOpacity
      onPress={() => navigation.navigate('Info')} // Naviguer vers InfoScreen
      style={styles.button}
      activeOpacity={0.8}
    >
      <Text style={styles.textButton}>Mes infos</Text>
    </TouchableOpacity>

    {/* Bouton Se déconnecter */}
    <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8}>
      <Text style={styles.textButton}>Se déconnecter</Text>
    </TouchableOpacity>
  </View>
</ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%', // S'assure que l'image couvre tout l'écran
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4, // Épaisseur de la bordure
    borderColor: '#20135B',
  },
  touchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  addPhotoText: {
    color: '#888',
    fontSize: 16,
  },
  userName: {
    fontSize: 18,
    color: '#555',
    marginTop: 10,
  },
  button: {
    backgroundColor: '#20135B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#20135B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
  },
});

export default ProfileScreen;