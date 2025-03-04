// Modifier le compte

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons'

const Z1_ModifScreen = ({ navigation }) => {
  const [lastPassword, setLastPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

{/* Fleche de retour header */}
const handleGoBack = () => {
  console.log("Bouton de retour pressé");
  navigation.goBack();
};
{/* Fleche de retour header */}

  const handleRegister = async () => {
    if (newPassword !== confirmNewPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

//============================================================
// rajouter verification dans bdd de l'ancien mot de passe
//============================================================

    try {
      const response = await fetch('https://backend-city-connect.vercel.app/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, newPassword }),
      });

      const data = await response.json();
      console.log("Réponse du backend :", data);
      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
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

        {/* Fleche de retour header */}
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <FontAwesome name="arrow-left" size={25} color="#20135B" />
        </TouchableOpacity>
        {/* Fleche de retour header */}

      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Changer le MDP</Text>
          <TextInput 
            placeholder="Ancien mot de passe" 
            style={styles.input} 
            value={lastPassword} 
            onChangeText={setLastPassword} 
          />
          <Text style={styles.linkText}>mot de passe oublié ?</Text>
          <TextInput 
            placeholder="Nouveau mot de passe" 
            style={styles.input} 
            value={newPassword} 
            onChangeText={setNewPassword} 
          />
          <TextInput 
            placeholder="Confirmer le mot de passe" 
            style={styles.input} 
            secureTextEntry 
            value={confirmNewPassword} 
            onChangeText={setConfirmNewPassword} 
          />
          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>Valider la modification</Text>
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
    marginTop: 120,
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
    marginTop: 2,
    marginBottom: 25,
  },

// Fleche de retour header
  backButton: {
    position: 'absolute',
    top: 60, // Position relative au haut de l'écran (ajustez selon vos besoins)
    left: 20, // Distance par rapport au bord gauche
    zIndex: 21, // Plus élevé que le zIndex du Header
    padding: 10, // Zone cliquable étendue
    backgroundColor: 'transparent', // Fond transparent pour respecter le design
  },
// Fleche de retour header


});

export default Z1_ModifScreen;