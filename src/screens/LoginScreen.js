import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ImageBackground, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
        const response = await fetch('https://backend-city-connect.vercel.app/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("Réponse du backend :", data); // Affiche la réponse complète du serveur

        if (response.ok) {
            await AsyncStorage.setItem('token', data.token);
            console.log("Token stocké :", await AsyncStorage.getItem('token')); // Vérifie le stockage
            navigation.reset({
                index: 0,
                routes: [{ name: 'Dashboard' }],
            });
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
    }
};


  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>CityConnect</Text>
        <Text style={styles.subtitle}>DÉCOUVRE LA VILLE AVEC UN HABITANT</Text>

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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>Sign up with Google</Text>
        </TouchableOpacity>

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
});

export default LoginScreen;
