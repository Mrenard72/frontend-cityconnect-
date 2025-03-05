import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ImageBackground, Image, Alert 
} from 'react-native';
import * as AuthSession from "expo-auth-session"
import AsyncStorage from '@react-native-async-storage/async-storage'; // 📌 Stockage local pour gérer le token utilisateur

const CLIENT_ID = "994283205046-ecibtacvb02sjvtg578vj6eg5f1rledh.apps.googleusercontent.com"; // Ton Client ID Web
// 📌 Écran de connexion (Login)
const LoginScreen = ({ navigation }) => {
  // ✅ États pour stocker les informations saisies par l'utilisateur
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  


// 📌 Configuration Google Sign-In


  // 🔐 Fonction pour gérer la connexion
  const handleLogin = async () => {
    try {
        // 🔗 Requête vers l'API pour tenter de se connecter
        const response = await fetch('https://backend-city-connect.vercel.app/auth/login', {
            method: 'POST', // 📩 Envoi des données via une requête POST
            headers: { 'Content-Type': 'application/json' }, // 📌 Indique que les données envoyées sont en JSON
            body: JSON.stringify({ email, password }), // 🔒 Envoi des identifiants utilisateur
        });

        const data = await response.json(); // 📥 Récupération de la réponse du serveur
        console.log("Réponse du backend :", data); // 🖥️ Affiche la réponse complète du serveur dans la console

        if (response.ok) {
            // 🔑 Stocker le token dans AsyncStorage pour les futures requêtes
            await AsyncStorage.setItem('token', data.token);
            console.log("Token stocké :", await AsyncStorage.getItem('token')); // 🔍 Vérifie que le token est bien enregistré

            // 🚀 Redirection vers le tableau de bord après connexion
            navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
            });
        } else {
            // ⚠️ Affiche une alerte si la connexion échoue
            Alert.alert("Erreur de connexion", data.message);
        }
    } catch (error) {
        console.error('❌ Erreur lors de la connexion:', error);
        Alert.alert("Erreur", "Impossible de se connecter. Vérifiez votre connexion internet.");
    }
  };


  // 🔹 Fonction pour gérer la connexion Google avec Expo
  const handleGoogleLogin = async () => {
    try {
      const redirectUri = AuthSession.makeRedirectUri(); // Génère une URI de redirection automatique

      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=id_token&scope=openid%20profile%20email`;

      const result = await AuthSession.startAsync({
        authUrl,
        returnUrl: AuthSession.makeRedirectUri(),
      });
      

      if (result.type === "success") {
        const { id_token } = result.params;
        setToken(id_token);

        // Envoie le token Google au backend Express
        const response = await fetch("https://backend-city-connect.vercel.app/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: id_token }),
        });

        const data = await response.json();
        console.log("Réponse Google Backend :", data);

        if (response.ok) {
          await AsyncStorage.setItem("token", data.token);
          navigation.reset({
            index: 0,
            routes: [{ name: "Dashboard" }],
          });
        } else {
          Alert.alert("Erreur", data.message);
        }
      } else {
        Alert.alert("Erreur", "Connexion Google annulée.");
      }
    } catch (error) {
      console.error("Erreur Google Sign-In :", error);
      Alert.alert("Erreur", "Connexion Google échouée.");
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        {/* 🏙️ Logo et titre de l'application */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>CityConnect</Text>
        <Text style={styles.subtitle}>DÉCOUVRE LA VILLE AVEC UN HABITANT</Text>

        {/* 📧 Champ de saisie pour l'email */}
        <TextInput 
          placeholder="Email" 
          style={styles.input} 
          value={email} 
          onChangeText={setEmail} 
          keyboardType="email-address" // 📌 Clavier adapté pour les adresses email
        />

        {/* 🔒 Champ de saisie pour le mot de passe */}
        <TextInput 
          placeholder="Mot de passe" 
          style={styles.input} 
          secureTextEntry // 👀 Cache le mot de passe en mode sécurisé
          value={password} 
          onChangeText={setPassword} 
        />

        {/* 🟢 Bouton pour se connecter */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

       {/* 🔵 Connexion Google */}
       <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

        {/* 📌 Lien pour aller à la page d'inscription */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Pas encore de compte ? Inscris-toi</Text>
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
    width: 150,
    height: 150,
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
    fontFamily: 'FredokaOne',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  button: {
    backgroundColor: '#2D2A6E',
    fontFamily: 'FredokaOne',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'FredokaOne',
    fontSize: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
  },
  googleButtonText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#000',
  },
  linkText: {
    marginTop: 15,
    color: '#2D2A6E',
    fontFamily: 'FredokaOne',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginTop: 20,
    backgroundColor: '#fff',
  },
  googleButtonText: {
    fontFamily: 'FredokaOne',
    fontSize: 16,
    color: '#000',
  },
});

export default LoginScreen;
