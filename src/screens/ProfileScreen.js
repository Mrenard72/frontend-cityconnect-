import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
<<<<<<< HEAD
import Header from '../components/Header';
=======
import { CommonActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const handleLogout = async (navigation) => {
  try {
    await AsyncStorage.removeItem('token');
    console.log("Token supprimé :", await AsyncStorage.getItem('token'));

    // 🔹 Redirection vers l'écran d'accueil après déconnexion
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  } catch (error) {
    console.error("Erreur lors de la déconnexion :", error);
  }
};
>>>>>>> 56108ad1e63c0e292628c11690ccb7aa55b0fd95

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
        <Header/>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleProfileImagePress} style={styles.touchable}>
            {ProfileImage ? (
              <Image source={{ uri: ProfileImage }} style={styles.profileImage} />
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
    <TouchableOpacity style={styles.logoutButton} onPress={() => handleLogout(navigation)}>
      <Text style={styles.logoutButtonText}>Déconnexion</Text>
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
    paddingTop:180,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 80,
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
  logoutButton: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
<<<<<<< HEAD
    fontSize: 18,
    fontWeight: 'FredokaOne',
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
=======
    fontSize: 16,
    fontFamily: 'FredokaOne',
>>>>>>> 56108ad1e63c0e292628c11690ccb7aa55b0fd95
  },
});

export default ProfileScreen;