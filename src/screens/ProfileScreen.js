import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Alert, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import FontAwesome from "react-native-vector-icons/FontAwesome";

// 📌 Écran du profil utilisateur
const ProfileScreen = ({ navigation }) => {
  // ✅ États pour stocker les données utilisateur
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [userToken, setUserToken] = useState(null);

  // 🚀 Fonction pour récupérer le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // ✅ Récupération du token
        if (!token) {
          console.log("🔴 Aucun token trouvé, redirection vers la connexion.");
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          return;
        }

        setUserToken(token); // ✅ Stocker le token pour l’upload d’image

        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log("🔍 Profil reçu :", data); // ✅ Vérification du profil

        if (response.ok) {
          setUserName(data.username);
          setProfileImage(data.photo); // ✅ Mettre à jour l’image de profil
        } else {
          console.log("❌ Erreur récupération profil :", data.message);
          await AsyncStorage.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 🚀 Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      console.log("🚪 Déconnexion en cours...");
      await AsyncStorage.removeItem('token'); // ✅ Suppression du token

      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion :", error);
      Alert.alert("Erreur", "Impossible de se déconnecter.");
    }
  };

  // 📷 Fonction pour ouvrir la galerie et choisir une photo
  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // ✅ Mise à jour immédiate pour effet visuel
      uploadImage(result.assets[0].uri);
    }
  };

  // 🚀 Fonction pour uploader l'image sur Cloudinary via le backend
  const uploadImage = async (uri) => {
    if (!userToken) {
      console.log("🔴 Aucun token disponible pour uploader l'image.");
      Alert.alert("Erreur", "Vous devez être connecté pour mettre à jour votre photo.");
      return;
    }

    let formData = new FormData();
    formData.append('profilePic', {
      uri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      console.log("📤 Envoi de l'image :", uri); // ✅ Vérification
      const response = await fetch('https://backend-city-connect.vercel.app/users/upload-profile-pic', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`
        },
        body: formData
      });

      const data = await response.json();
      console.log("🔍 Réponse de l'upload :", data);

      if (response.ok) {
        setProfileImage(data.photo); // ✅ Mise à jour de la photo affichée
        Alert.alert('Succès', 'Photo mise à jour !');
      } else {
        console.log("❌ Erreur lors de l'upload :", data.message);
        Alert.alert('Erreur', data.message);
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'upload :", error);
      Alert.alert('Erreur', 'Impossible d\'uploader l\'image');
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      
      <View style={styles.container}>
        {/* 📸 Section de la photo de profil */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleChoosePhoto} style={styles.touchable}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addPhotoText}>Ajouter une photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ✅ Affichage dynamique du nom utilisateur */}
        <Text style={styles.userName}>{userName ? userName : "Chargement..."}</Text>

        {/* 🔴 Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
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
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 180,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
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
    justifyContent: 'center',
  },
  userName: {
    fontSize: 22, // 📌 Augmenté pour plus de lisibilité
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 15,
  },
  button: {
    flexDirection: "row", // Aligner le texte et l'icône en ligne
    justifyContent: "center", // Pousse le texte à gauche et l'icône à droite
    alignItems: "center", // Centre verticalement le texte et l'icône
    backgroundColor: '#20135B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
  icon: {
    marginLeft: 10,
},
  logoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    opacity: 0.8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
});

export default ProfileScreen;