// Supprimer le compte

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

const Z2_DeleteScreen = ({ navigation }) => {
  // États pour stocker les valeurs des champs de saisie
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');

  // Récupération du token une seule fois au chargement du composant
  useEffect(() => {
    const fetchToken = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    };
    fetchToken();
  }, []);

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
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              if (!token) {
                alert("Erreur : Token introuvable !");
                return;
              }

              const response = await fetch('https://backend-city-connect.vercel.app/auth/delete', {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                alert("Votre compte a été supprimé.");
                await AsyncStorage.removeItem('token');
                navigation.navigate('LoginScreen');
              } else {
                alert("Erreur lors de la suppression.");
              }
            } catch (error) {
              alert("Erreur serveur.");
            }
          }
        }
      ]
    );
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
            onChangeText={setUsername}
          />

          {/* Champ de saisie pour l'adresse email */}
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          {/* Champ de saisie pour le mot de passe */}
          <TextInput
            placeholder="Saisir le mot de passe"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

      

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
  },
});

export default Z2_DeleteScreen;
