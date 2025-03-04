// Modifier le compte (Changement de mot de passe)

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

const Z1_ModifScreen = ({ navigation }) => {
  // États pour stocker les valeurs des champs de saisie
  const [lastPassword, setLastPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  /**
   * Fonction permettant de revenir à l'écran précédent
   */
  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };

  /**
   * Fonction permettant de changer le mot de passe de l'utilisateur
   */
  const handleChangePassword = async () => {
    // Vérifie si les nouveaux mots de passe sont identiques
    if (newPassword !== confirmNewPassword) {
      alert("Les mots de passe ne correspondent pas !");
      return;
    }

    try {
      // Récupération du token stocké dans AsyncStorage pour authentifier la requête
      const token = await AsyncStorage.getItem('token');

      // Vérifie si l'utilisateur est bien connecté
      if (!token) {
        alert("Vous devez être connecté pour changer votre mot de passe !");
        return;
      }

      // Envoi de la requête au serveur pour modifier le mot de passe
      const response = await fetch('https://backend-city-connect.vercel.app/auth/change-password', {
        method: 'PUT', // Méthode PUT pour mettre à jour les données
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Ajout du token pour l'authentification
        },
        body: JSON.stringify({ lastPassword, newPassword }), // Envoi de l'ancien et du nouveau mot de passe
      });

      // Récupération de la réponse du serveur
      const data = await response.json();
      console.log("Réponse du backend :", data);

      // Vérifie si la requête a réussi
      if (response.ok) {
        alert("Mot de passe modifié avec succès !");
        navigation.navigate('Z_InfosScreen'); // Redirection vers l'écran des informations utilisateur
      } else {
        alert(data.message || 'Une erreur est survenue');
      }

    } catch (error) {
      console.error("Erreur lors de la modification du mot de passe :", error);
      alert("Erreur lors de la modification du mot de passe");
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
          <Text style={styles.title}>Changer le MDP</Text>

          {/* Champ de saisie pour l'ancien mot de passe */}
          <TextInput 
            placeholder="Ancien mot de passe" 
            style={styles.input} 
            value={lastPassword} 
            onChangeText={(text) => { 
            console.log("📝 Ancien mot de passe saisi :", text); // Ajout d'un log
            setLastPassword(text);
      }} 
  secureTextEntry
/>

          {/* Lien pour récupérer son mot de passe en cas d'oubli */}
          <Text style={styles.linkText}>Mot de passe oublié ?</Text>

        
          <TextInput 
  placeholder="Nouveau mot de passe" 
  style={styles.input} 
  value={newPassword} 
  onChangeText={(text) => { 
    console.log("📝 Nouveau mot de passe saisi :", text); // Ajout d'un log
    setNewPassword(text);
  }} 
  secureTextEntry
/>

<TextInput 
  placeholder="Confirmer le mot de passe" 
  style={styles.input} 
  value={confirmNewPassword} 
  onChangeText={(text) => { 
    console.log("📝 Confirmation du mot de passe :", text); // Ajout d'un log
    setConfirmNewPassword(text);
  }} 
  secureTextEntry
/>

          {/* Bouton pour valider la modification du mot de passe */}
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
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

export default Z1_ModifScreen;
