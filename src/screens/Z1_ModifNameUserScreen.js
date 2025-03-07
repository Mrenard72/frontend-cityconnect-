// Modifier le compte (Changement de nom d'utilisateur)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

const Z1_ModifNameUserScreen = ({ navigation }) => {
  // États pour stocker les valeurs des champs de saisie
  const [lastUsername, setLastUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Fonction permettant de revenir à l'écran précédent
   */
  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };

  /**
   * Fonction permettant de changer le nom d'utilisateur de l'utilisateur
   */
  const handleChangeUsername = async () => {
    // Vérifie si le nouveau nom d'utilisateur est identique avec l'ancien
    if (newUsername === lastUsername) {
      alert("Les noms d'utilisateurs sont identiques, veuillez en saisir un nouveau !");
      return;
    }

    try {
      // Récupération du token stocké dans AsyncStorage pour authentifier la requête
      const token = await AsyncStorage.getItem('token');

      // Vérifie si l'utilisateur est bien connecté
      if (!token) {
        alert("Vous devez être connecté pour changer votre nom d'utilisateur !");
        return;
      }

      // Envoi de la requête au serveur pour modifier le nom d'utilisateur
      const response = await fetch('https://backend-city-connect.vercel.app/auth/change-username', {
        method: 'PUT', // Méthode PUT pour mettre à jour les données
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ajout du token pour l'authentification
        },
        body: JSON.stringify({ lastUsername, newUsername }), // Envoi de l'ancien et du nouveau nom d'utilisateur
      });

      // Récupération de la réponse du serveur
      const data = await response.json();
      console.log("Réponse du backend :", data);

      // Vérifie si la requête a réussi
      if (response.ok) {
        alert("Nom d'utilisateur modifié avec succès !");
        navigation.navigate('Z_InfosScreen'); // Redirection vers l'écran des informations utilisateur
      } else {
        alert(data.message || 'Une erreur est survenue');
      }

    } catch (error) {
      console.error("Erreur lors de la modification du nom d'utilisateur :", error);
      alert("Erreur lors de la modification du nom d'utilisateur");
    }
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      {/* Bouton de retour placé au-dessus du Header */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={25} color="#20135B" />
      </TouchableOpacity>

      {/* Header de l'application */}
      <Header />

      {/* Contenu principal dans un ScrollView pour permettre le défilement */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Changer le nom d'utilisateur</Text>

          {/* Champ de saisie pour l'ancien nom d'utilisateur */}
          <TextInput 
            placeholder="Ancien nom d'utilisateur" 
            style={styles.input} 
            value={lastUsername} 
            onChangeText={(text) => { 
            console.log("📝 Ancien nom d'utilisateur saisi :", text); // Ajout d'un log
            setLastUsername(text);
      }} 
/>
        
          <TextInput 
  placeholder="Nouveau nom d'utilisateur" 
  style={styles.input} 
  value={newUsername} 
  onChangeText={(text) => { 
    console.log("📝 Nouveau nom d'utilisateur saisi :", text); // Ajout d'un log
    setNewUsername(text);
  }} 
/>

<TextInput 
  placeholder="Saisir le mot de passe" 
  style={styles.input} 
  value={password} 
  onChangeText={(text) => { 
    console.log("📝 Saisir le mot de passe :", text); // Ajout d'un log
    setPassword(text);
  }} 
  secureTextEntry // Masquer les caractères saisis
/>

  {/* Lien pour récupérer son nom d'utilisateur en cas d'oubli */}
  <Text style={styles.linkText}>Mot de passe oublié ?</Text>

          {/* Bouton pour valider la modification du nom d'utilisateur */}
          <TouchableOpacity style={styles.button} onPress={handleChangeUsername}>
            <Text style={styles.buttonText}>Valider la modification</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

// Styles
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
    paddingTop: 50,
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 21,
    padding: 10,
    backgroundColor: 'transparent',
  },
});

export default Z1_ModifNameUserScreen;
