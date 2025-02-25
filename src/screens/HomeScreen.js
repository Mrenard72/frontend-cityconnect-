import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          navigation.replace('Login');
          return;
        }

        const response = await fetch('http://192.168.1.93:3000/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUser(data);
        } else {
          alert(data.message);
          navigation.replace('Login');
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login'); // Redirige vers l’écran de connexion
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>CityConnect</Text>
        <Text style={styles.subtitle}>DÉCOUVRE LA VILLE AVEC UN HABITANT</Text>

        {user ? (
          <>
            <Text style={styles.welcomeText}>Bienvenue, {user.username} !</Text>
            <Text style={styles.emailText}>{user.email}</Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        )}

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Déconnexion</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D2A6E',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
