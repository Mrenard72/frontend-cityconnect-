// Supprimer le compte

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

const Z2_DeleteScreen = ({ navigation }) => {
  // États pour stocker les valeurs des champs de saisie
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Fonction permettant de revenir à l'écran précédent
   */
  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };

  /**
   * Fonction permettant de supprimer le compte utilisateur
   */

  // Récupération du token stocké dans l'AsyncStorage
  const [token, setToken] = useState('');
  AsyncStorage.getItem('token', (err, value) => {
    if (value !== null) {
      setToken(value);
    }
  });

  // Fonction pour supprimer le compte utilisateur
  const handleDeleteAccount = async () => {
    console.log("Bouton de suppression de compte pressé"); // Ajout d'un log
    console.log("🔐 Token de l'utilisateur :", token); // Ajout d'un log

    // Vérification de la présence du token
    if (token === null) {
      console.log("❌ Token introuvable"); // Ajout d'un log
      alert("Token introuvable");
      return;
    }

    // Vérification des champs de saisie
    if (username === '' || email === '' || password === '') {
      console.log("❌ Veuillez remplir tous les champs"); // Ajout d'un log
      alert("Veuillez remplir tous les champs");
      return;
    }

    // Envoi de la requête au serveur pour supprimer le compte
    const response = await fetch('https://backend-city-connect.vercel.app/auth/delete', {
      method: 'DELETE', // Méthode DELETE pour supprimer le compte
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Ajout du token pour l'authentification
      },
      body: JSON.stringify({ username, email, password }), // Envoi des données de l'utilisateur

    });
    
    // Vérification de la réponse du serveur
    if (response.ok) {  // Si la réponse est de type 200
      console.log("🚀 Compte supprimé avec succès !"); // Ajout d'un log  
      alert("Votre compte a été supprimé avec succès !");
      // Redirection vers l'écran de connexion
      navigation.navigate('LoginScreen');
      
    } else { // Si la réponse est de type 400 ou 500
      console.log("❌ Une erreur s'est produite"); // Ajout d'un log
      alert("Une erreur s'est produite");
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
          <Text style={styles.title}>Supprimer le compte</Text>
          
          {/* Champ de saisie pour le nom d'utilisateur */}
          <TextInput
            placeholder="Nom d'utilisateur"
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              console.log("📝 Nom d'utilisateur saisi :", text); // Ajout d'un log
              setUsername(text);
            }}
          />

          {/* Champ de saisie pour l'adresse email */}
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              console.log("📝 Email saisi :", text); // Ajout d'un log
              setEmail(text);
            }}
          />

          {/* Champ de saisie pour le mot de passe */}
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

          {/* Lien pour récupérer son mot de passe en cas d'oubli */}
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>

          {/* Bouton pour supprimer le compte */}
          <TouchableOpacity style={styles.button} onPress={handleDeleteAccount}>
            <Text style={styles.buttonText}>Supprimer le compte</Text>
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
    width: '100%', // Largeur de l'image de fond
    height: '100%', // Hauteur de l'image de fond
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, // Ajout d'un espacement sous le header
  },
  container: {
    width: '90%', // Largeur du container
    alignItems: 'center', // Centrer les éléments
    marginTop: 20, // Marge en haut
  },
  title: {
    fontSize: 32, // Taille de la police
    fontFamily: 'FredokaOne', // Police du titre
    color: '#2D2A6E', // Couleur du texte
    marginBottom: 30, // Marge en bas
  },
  input: {
    width: '100%', // Largeur du champ de saisie
    padding: 14, // Remplissage intérieur
    marginVertical: 10, // Marge verticale
    borderWidth: 1, // Largeur de la bordure
    borderColor: '#ccc', // Couleur de la bordure
    borderRadius: 12, // Bordure arrondie
    backgroundColor: 'rgba(255,255,255,0.9)', // Couleur de fond
    textAlign: 'center', // Centrer le texte
    fontSize: 16, // Taille de la police
    fontWeight: 'bold', // Style de la police
    color: '#333', // Couleur du texte
  },
  button: {
    backgroundColor: '#2D2A6E', // Couleur de fond du bouton
    padding: 15, // Remplissage intérieur
    borderRadius: 12, // Bordure arrondie
    width: '100%', // Largeur du bouton
    alignItems: 'center', // Centrer les éléments
    marginTop: 120, // Marge en haut
  },
  buttonText: {
    color: '#FFFFFF', // Couleur du texte
    fontSize: 18, // Taille de la police
    fontFamily: 'FredokaOne', // Police du texte
  },
  linkText: {
    marginTop: 20, // Marge en haut
    color: '#2D2A6E', // Couleur du texte
    fontFamily: 'FredokaOne', // Police du texte
    fontSize: 16, // Taille de la police
    marginTop: 2, // Marge en haut
    marginBottom: 25, // Marge en bas
  },
  backButton: {
    position: 'absolute', // Position absolue
    top: 60, // Position en haut
    left: 20, // Position à gauche
    zIndex: 21, // Positionnement en avant
  },
});

export default Z2_DeleteScreen;
