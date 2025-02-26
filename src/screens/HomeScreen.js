import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log("Token récupéré dans HomeScreen :", token);
        
        if (!token) {
          console.log("Aucun token trouvé, redirection vers Login...");
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
        console.log("Réponse de /auth/profile :", data);

        if (!response.ok) {
          console.log("Token invalide, suppression et redirection...");
          await AsyncStorage.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        }
        
      } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.navigate('Login');
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
    fontFamily: 'FredokaOne',
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
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 10,
  },
  emailText: {
    fontSize: 16,
    fontFamily: 'FredokaOne',
    color: '#555',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'FredokaOne',
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
    fontFamily: 'FredokaOne',
  },
});

export default HomeScreen;
