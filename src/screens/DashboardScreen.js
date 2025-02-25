import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DashboardScreen = ({ navigation }) => {
  
  const handleLogout = async () => {
    await AsyncStorage.removeItem('token'); // Supprime le token
    console.log("Utilisateur déconnecté, redirection vers HomeScreen...");
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }], // Envoie à Home après logout
    });
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Tableau de bord</Text>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('../../assets/explore.jpg')} style={styles.cardImage} />
          <Text style={styles.cardText}>J'explore</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Discover')}>
          <Image source={require('../../assets/discover.jpg')} style={styles.cardImage} />
          <Text style={styles.cardText}>Je fais découvrir</Text>
        </TouchableOpacity>

        {/* Bouton Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Déconnexion</Text>
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
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 5,
  },
  logoutButton: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;
