import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { CommonActions } from '@react-navigation/native';

const ExploreScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Explorer la ville</Text>

        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'aroundMe' })}>
          <Text style={styles.buttonText}>Autour de moi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'location' })}>
          <Text style={styles.buttonText}>Par localisation</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'activity' })}>
          <Text style={styles.buttonText}>Par activité</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Map', { filter: 'date' })}>
          <Text style={styles.buttonText}>Par date</Text>
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
});

export default ExploreScreen;
