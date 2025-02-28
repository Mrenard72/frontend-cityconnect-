import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Alert, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import FontAwesome from "react-native-vector-icons/FontAwesome";

// 📌 Écran du profil utilisateur
const ProfileScreen = ({ navigation }) => {
  // ✅ États pour stocker les données utilisateur
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState(''); // 🔹 Stocke le nom de l'utilisateur

  // 🚀 Fonction pour récupérer le profil utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // ✅ Récupère le token stocké
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // 🔄 Redirection si pas de token
          return;
        }

        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserName(data.username); // ✅ Met à jour le nom de l'utilisateur
        } else {
          console.log("Erreur récupération profil :", data.message);
          await AsyncStorage.removeItem('token'); // ❌ Supprime le token si erreur
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, []);

  // 🚀 Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    try {
      console.log("Tentative de déconnexion...");
      
      await AsyncStorage.removeItem('token'); // ✅ Suppression du token
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        console.log("✅ Déconnexion réussie, token supprimé !");
      } else {
        console.log("❌ Token toujours présent :", token);
      }
  
      // 🔄 Redirection forcée vers la page de connexion
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
  
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
      setProfileImage(result.assets[0].uri);
    }
  };

  // 📸 Fonction pour afficher une alerte et changer la photo de profil
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
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      
      <View style={styles.container}>
        {/* 📸 Section de la photo de profil */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleProfileImagePress} style={styles.touchable}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addPhotoText}>Changer de photo</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ✅ Affichage dynamique du nom utilisateur */}
        <Text style={styles.userName}>{userName ? userName : "Chargement..."}</Text>

        {/* 📌 Boutons des différentes sections */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes services</Text>
          <FontAwesome name="list-alt" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes sorties</Text>
          <FontAwesome name="calendar" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Info')} style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes infos</Text>
          <FontAwesome name="id-card" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

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
    backgroundColor: '#ddd',
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