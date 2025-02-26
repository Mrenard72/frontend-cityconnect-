import React, { useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Alert, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker'; // 📌 Permet de choisir une image depuis la galerie
import Header from '../components/Header'; // 📌 Composant d'en-tête (Header)

// 📌 Écran du profil utilisateur
const ProfileScreen = ({ navigation }) => {
  // ✅ État pour stocker l'image de profil choisie par l'utilisateur
  const [ProfileImage, setProfileImage] = useState(null);

  // 📷 Fonction pour ouvrir la galerie et choisir une photo
  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // 📌 Accepte uniquement les images
      allowsEditing: true, // ✂️ Autorise le recadrage de l'image
      aspect: [1, 1], // 📏 Format carré
      quality: 1, // 🖼️ Qualité maximale
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // ✅ Stocke l'image sélectionnée
    }
  };

  // 📸 Fonction pour afficher une alerte et changer la photo de profil
  const handleProfileImagePress = () => {
    Alert.alert(
      'Changer de photo de profil', // 🖼️ Titre de l'alerte
      '', // 📝 Aucun message supplémentaire
      [
        { text: 'Annuler', style: 'cancel' }, // ❌ Option d'annulation
        { text: 'Changer', onPress: handleChoosePhoto }, // ✅ Ouvre la galerie d'images
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')} // 🌆 Image de fond
      style={styles.background}
    >
      <Header /> {/* 📌 Affiche le composant d'en-tête */}
      
      <View style={styles.container}>
        {/* 📸 Section de la photo de profil */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleProfileImagePress} style={styles.touchable}>
            {ProfileImage ? (
              <Image source={{ uri: ProfileImage }} style={styles.profileImage} /> // ✅ Affiche l'image choisie
            ) : (
              <Text style={styles.addPhotoText}>Changer de photo</Text> // 📌 Texte par défaut si aucune image
            )}
          </TouchableOpacity>
        </View>

        {/* 👤 Nom de l'utilisateur (à récupérer dynamiquement si possible) */}
        <Text style={styles.userName}>Votre Nom</Text>

        {/* 📌 Bouton "Mes services" */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes services</Text>
        </TouchableOpacity>

        {/* 📌 Bouton "Mes sorties" */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes sorties</Text>
        </TouchableOpacity>

        {/* 📌 Bouton "Mes infos" */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Info')} // 🚀 Redirection vers l'écran Info
          style={styles.button}
          activeOpacity={0.8}
        >
          <Text style={styles.textButton}>Mes infos</Text>
        </TouchableOpacity>

        {/* 🔴 Bouton de déconnexion */}
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
  textButton: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
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
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
  logoutButton: {
    backgroundColor: '#E53935',
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