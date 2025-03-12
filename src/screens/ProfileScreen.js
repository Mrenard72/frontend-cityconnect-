import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Alert, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAuth } from '../components/AuthContex';
import { useTranslation } from 'react-i18next';
import { CommonActions } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // ✅ Gestion des traductions
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pour éviter les mises à jour d'état après démontage du composant
  const isMounted = useRef(true);
  
  // Récupération de la fonction setUser depuis le contexte d'authentification
  const { setUser } = useAuth();

  // Effet de nettoyage lors du démontage du composant
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fonction de navigation sécurisée vers l'écran de connexion
  const navigateToLogin = () => {
    try {
      // Utilisation de CommonActions pour plus de compatibilité
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        })
      );
    } catch (error) {
      console.error("Erreur lors de la navigation vers Login:", error);
      // Méthode alternative si la première échoue
      navigation.navigate('Login');
    }
  };

  // Effet qui s'exécute au chargement du composant et à chaque changement de langue
  useEffect(() => {
    setIsLoading(true);
    
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log("Aucun token trouvé, redirection vers Login");
          setUser(null);
          navigateToLogin();
          return;
        }

        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Vérification si le composant est toujours monté
        if (!isMounted.current) return;

        const data = await response.json();
        if (response.ok) {
          setUserName(data.username);
          const storedImage = await AsyncStorage.getItem('profileImage');
          setProfileImage(data.photo || storedImage);
          setUserToken(data._id);
        } else {
          console.log("Erreur récupération profil :", data.message);
          await AsyncStorage.removeItem('token');
          setUser(null);
          navigateToLogin();
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("Erreur lors de la récupération du profil :", error);
        }
      } finally {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [i18n.language]); // ✅ Recharge les données si la langue change

  // 🚀 Déconnexion utilisateur
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      // Utilisation de la fonction sécurisée de navigation
      navigateToLogin();
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      // Tentative alternative en cas d'échec
      navigation.navigate('Login');
    }
  };

   // 📷 Fonction pour ouvrir la galerie et choisir une photo, puis l’uploader
const handleChoosePhoto = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled) {
    const selectedImageUri = result.assets[0].uri;
    setProfileImage(selectedImageUri); // ✅ Mise à jour immédiate de l’affichage
    await uploadImage(selectedImageUri); // ✅ Envoi de l’image après sélection !
  }
};

const uploadImage = async (uri) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    Alert.alert("Erreur", "Vous devez être connecté pour mettre à jour votre photo.");
    return;
  }

  console.log("📤 Début de l'upload sur Cloudinary");

  try {
    let formData = new FormData();
formData.append('file', {
  uri: uri,
  type: 'image/jpeg', // Assurez-vous que l'image a un bon type MIME
  name: `profile_${Date.now()}.jpg`, // Nom unique
    });
    formData.append('upload_preset', 'default_preset'); // Assure-toi que l'upload preset existe
    formData.append('cloud_name', 'dasntwyhd');

    // 🚀 Envoie l'image sur Cloudinary
    const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/dasntwyhd/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const cloudinaryData = await cloudinaryResponse.json();
    if (!cloudinaryData.secure_url) {
      throw new Error("Cloudinary n'a pas renvoyé d'URL.");
    }

    console.log("✅ Upload Cloudinary réussi :", cloudinaryData.secure_url);

    // 🚀 Maintenant, envoie l’URL au backend
    const backendResponse = await fetch('https://backend-city-connect.vercel.app/users/upload-profile-pic', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ photoUrl: cloudinaryData.secure_url }),
    });

    const backendData = await backendResponse.json();
    if (!backendResponse.ok) {
      throw new Error(backendData.message || "Erreur serveur");
    }

    console.log("✅ Backend mis à jour avec succès :", backendData);

    setProfileImage(backendData.photo);
    await AsyncStorage.setItem('profileImage', backendData.photo);
    Alert.alert('Photo mise à jour !');

  } catch (error) {
    console.error("❌ Erreur lors de l'upload :", error);
    Alert.alert('Erreur', 'Impossible d\'uploader l\'image');
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

      {/* 🌍 Sélecteur de langue */}
      <View style={styles.languageSwitcher}>
        <TouchableOpacity onPress={() => i18n.changeLanguage('fr')}>
          <Image source={require('../../assets/france.png')} style={styles.flag} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => i18n.changeLanguage('en')}>
          <Image source={require('../../assets/anglais.png')} style={styles.flag} />
        </TouchableOpacity>
      </View>

      <View>
        <Text style={styles.title}>{t('profile.title')}</Text>
      </View>

      <View style={styles.container}>
        {/* 📸 Photo de profil */}
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleProfileImagePress} style={styles.touchable}>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <Text style={styles.addPhotoText}>{t('profile.addPhoto')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{userName || t('profile.loading')}</Text>

        {/* 📌 Boutons avec traduction */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ServicesScreen')}>
          <Text style={styles.textButton}>{t('profile.myServices')}</Text>
          <FontAwesome name="list-alt" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('SortiesScreen')}>
          <Text style={styles.textButton}>{t('profile.myOutings')}</Text>
          <FontAwesome name="calendar" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Z_InfosScreen')}>
          <Text style={styles.textButton}>{t('profile.myInfo')}</Text>
          <FontAwesome name="id-card" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('MyPageScreen', { userId: userToken })}>
          <Text style={styles.textButton}>{t('profile.myPage')}</Text>
          <FontAwesome name="user" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        {/* 🔴 Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>{t('profile.logout')}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

// 📌 Ajout des styles
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  languageSwitcher: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    right: 20,
  },
  flag: {
    width: 40,
    height: 30,
    marginHorizontal: 5,
  },
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 180, top: -50, },
  imageContainer: {
    width: 150, height: 150, borderRadius: 80, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    marginBottom: 20, borderWidth: 4, borderColor: '#20135B',
  },
  touchable: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  addPhotoText: { color: '#888', fontSize: 16, justifyContent: 'center' },
  userName: { fontSize: 22, fontFamily: 'FredokaOne', color: '#2D2A6E', marginBottom: 15 },
  title: { textAlign: 'center', fontSize: 28, fontFamily: 'FredokaOne', color: '#20135B', marginTop: 20 },
  button: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: '#20135B', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 8, marginVertical: 10, width: '70%',
  },
  textButton: { color: '#FFFFFF', fontSize: 20, fontFamily: 'FredokaOne' },
  icon: { marginLeft: 10 },
  logoutButton: { backgroundColor: '#E53935', paddingVertical: 12, borderRadius: 8, width: '50%', alignItems: 'center', marginTop: 20 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 20, fontFamily: 'FredokaOne' },
});

export default ProfileScreen;