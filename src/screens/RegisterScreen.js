// Fichier src/screens/RegisterScreen.js
import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.title}>CityConnect</Text>
        </View>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.subtitle}>Inscription</Text>
        <TextInput placeholder="Nom d'utilisateur" style={styles.input} />
        <TextInput placeholder="Mot de passe" style={styles.input} secureTextEntry />
        <TextInput placeholder="Confirmer le mot de passe" style={styles.input} secureTextEntry />
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Création</Text>
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
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButtonContainer: {
    position: 'absolute',
    left: 10,
    top: 40,
  },
  backButton: {
    fontSize: 24,
    color: '#2D2A6E',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D2A6E',
  },
  container: {
    width: '90%',
    alignItems: 'center',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
  },
  button: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;