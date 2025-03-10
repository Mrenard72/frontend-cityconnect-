import React, { useEffect, useState } from 'react';
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

const ProfileScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // ✅ Gestion des traductions
  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('');
  const [userToken, setUserToken] = useState(null);
  const { setUser } = useAuth();

  // 🚀 Récupération des infos utilisateur
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
          setUserName(data.username);
          setProfileImage(data.photo || await AsyncStorage.getItem('profileImage'));
          setUserToken(data._id);
        } else {
          console.log("Erreur récupération profil :", data.message);
          await AsyncStorage.removeItem('token');
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, [i18n.language]); // ✅ Recharge les données si la langue change

  // 🚀 Déconnexion utilisateur
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      navigation.navigate('Login');
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // 🚀 Gestion du changement de photo de profil
  const handleProfileImagePress = () => {
    Alert.alert(
      t('profile.changePhoto'),
      '',
      [
        { text: t('profile.cancel'), style: 'cancel' },
        { text: t('profile.change'), onPress: handleChoosePhoto },
      ]
    );
  };

  const handleChoosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      await AsyncStorage.setItem('profileImage', result.assets[0].uri);
    }
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
  container: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 180 },
  imageContainer: {
    width: 150, height: 150, borderRadius: 80, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    marginBottom: 20, borderWidth: 4, borderColor: '#20135B',
  },
  touchable: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  profileImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  addPhotoText: { color: '#888', fontSize: 16, justifyContent: 'center' },
  userName: { fontSize: 22, fontFamily: 'FredokaOne', color: '#2D2A6E', marginBottom: 15 },
  button: {
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    backgroundColor: '#20135B', paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: 8, marginVertical: 10, width: '70%',
  },
  textButton: { color: '#FFFFFF', fontSize: 20, fontFamily: 'FredokaOne' },
  icon: { marginLeft: 10 },
  logoutButton: { backgroundColor: '#E53935', paddingVertical: 12, borderRadius: 8, width: '50%', alignItems: 'center', position: 'absolute', bottom: 20 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 20, fontFamily: 'FredokaOne' },
});

export default ProfileScreen;
