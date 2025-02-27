import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground, TextInput, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback 
} from 'react-native';
import Header from '../components/Header';

const ExploreScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');

  const handleNavigateToMap = () => {
    if (!location.trim()) {
      alert('Veuillez entrer une ville ou des coordonnées');
      return;
    }
    navigation.navigate('Map', { filter: 'location', location });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
        <Header />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
          <Text style={styles.title}>Explorer la ville</Text>

          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'aroundMe' })}>
            <Text style={styles.buttonText}>Autour de moi</Text>
          </TouchableOpacity>

          {/* 🚀 Nouveau champ de saisie pour entrer une ville */}
          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'byLocality' })}>
            <Text style={styles.buttonText}>Par localisation</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'activity' })}>
            <Text style={styles.buttonText}>Par activité</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'date' })}>
            <Text style={styles.buttonText}>Par date</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: '#2D2A6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
});

export default ExploreScreen;
