import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ImageBackground, Image, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 📌 Stockage local pour gérer le token utilisateur

// 📌 Écran d'accueil (HomeScreen)
const HomeScreen = ({ navigation }) => {
  // ✅ État pour stocker les informations du profil utilisateur
  const [user, setUser] = useState(null);

  // 🎯 Effet qui s'exécute au montage du composant (vérification du token et récupération du profil)
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 🔑 Récupérer le token de connexion stocké
        const token = await AsyncStorage.getItem('token');
        console.log("Token récupéré dans HomeScreen :", token);
        
        if (!token) {
          console.log("Aucun token trouvé, redirection vers Login...");
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // 🚪 Redirige vers l'écran de connexion si pas de token
          return;
        }

        // 🔍 Vérification du token en appelant l'API backend
        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // 🔑 Ajoute le token dans les headers
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json(); // 📥 Récupération de la réponse du serveur
        console.log("Réponse de /auth/profile :", data);

        if (!response.ok) {
          console.log("Token invalide, suppression et redirection...");
          await AsyncStorage.removeItem('token'); // 🚫 Supprimer un token invalide
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] }); // 🚪 Redirige vers l'écran de connexion
        } else {
          setUser(data); // ✅ Stocker les informations du profil utilisateur
        }
        
      } catch (error) {
        console.error("❌ Erreur lors de la récupération du profil :", error);
      }
    };

    fetchUserProfile();
  }, []); // 🔄 S'exécute une seule fois lors du premier affichage

  // 🔐 Fonction pour gérer la déconnexion
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // 🚫 Supprime le token de connexion
    navigation.navigate('Login'); // 🚪 Redirige vers la page de connexion
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        {/* 🏙️ Logo et titre de l'application */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>CityConnect</Text>
        <Text style={styles.subtitle}>DÉCOUVRE LA VILLE AVEC UN HABITANT</Text>

        {/* 👤 Affichage des informations de l'utilisateur si connecté */}
        {user ? (
          <>
            <Text style={styles.welcomeText}>Bienvenue, {user.username} !</Text>
            <Text style={styles.emailText}>{user.email}</Text>
          </>
        ) : (
          <Text style={styles.loadingText}>Chargement du profil...</Text> // ⏳ Affiche un message si les données sont en cours de chargement
        )}

        {/* 🔴 Bouton de déconnexion */}
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
    width: '80%',
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
