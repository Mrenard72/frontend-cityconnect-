import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons'

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };
// fonction asynchrone pour gérer l'inscription 
  const handleRegister = async () => {
    // verifie que le mot de passe correspond 
    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      // envoie des données d'inscription au backend 
      const response = await fetch('https://backend-city-connect.vercel.app/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
// recuperation et affichage de la reponse serveur 
      const data = await response.json();
      console.log("Réponse du backend :", data);
      // incription reussi 
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
        // affichage message erreur 
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Erreur lors de l’inscription:', error);
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      {/* Bouton de retour placé au-dessus du Header */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={25} color="#20135B" />
      </TouchableOpacity>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Inscription</Text>
          <TextInput 
            placeholder="Nom d'utilisateur" 
            style={styles.input} 
            value={username} 
            onChangeText={setUsername} 
          />
          <TextInput 
            placeholder="Email" 
            style={styles.input} 
            value={email} 
            onChangeText={setEmail} 
          />
          <TextInput 
            placeholder="Mot de passe" 
            style={styles.input} 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword} 
          />
          <TextInput 
            placeholder="Confirmer le mot de passe" 
            style={styles.input} 
            secureTextEntry 
            value={confirmPassword} 
            onChangeText={setConfirmPassword} 
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Déjà un compte ? Connecte-toi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Ajout d'un espacement sous le header
  },
  container: {
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  button: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 25,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'FredokaOne',
  },
  linkText: {
    marginTop: 20,
    color: '#2D2A6E',
    fontFamily: 'FredokaOne',
    fontSize: 16,
  },
  backButton: {
    position: 'absolute',
    top: 60, // Position relative au haut de l'écran (ajustez selon vos besoins)
    left: 20, // Distance par rapport au bord gauche
    zIndex: 21, // Plus élevé que le zIndex du Header
    padding: 10, // Zone cliquable étendue
    backgroundColor: 'transparent', // Fond transparent pour respecter le design
  },
});

export default RegisterScreen;