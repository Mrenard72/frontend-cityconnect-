import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground, 
  Alert, TextInput, Modal, Button
} from 'react-native';
import * as Location from 'expo-location';
import Header from '../components/Header';

const ExploreScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // 📍 Obtenir la position actuelle et naviguer vers MapScreen avec le filtre 'aroundMe'
  const handleLocationSearch = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire pour cette fonctionnalité.");
      return;
    }
    try {
      let userLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = userLocation.coords;
      navigation.navigate('Carte', { 
        filter: 'aroundMe', 
        latitude, 
        longitude,
        region: { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
      });
    } catch (error) {
      Alert.alert("Erreur", "Impossible d’obtenir votre position.");
    }
  };

  // 🔎 Ouvrir la modale pour saisir une ville dès l'appui sur "Par localisation"
  const handleCitySearch = () => {
    setShowModal(true);
  };

  // 🔎 Valider la saisie d'une ville grâce au géocodage et naviguer vers MapScreen
  const handleCitySearchSubmit = async () => {
    if (searchQuery.trim() === '') {
      Alert.alert("Erreur", "Veuillez entrer un nom de ville.");
      return;
    }
    try {
      const geocodeResults = await Location.geocodeAsync(searchQuery);
      if (geocodeResults && geocodeResults.length > 0) {
        const { latitude, longitude } = geocodeResults[0];
        console.log("Ville trouvée :", searchQuery, "Coordonnées :", latitude, longitude);
        setShowModal(false);
        // Transmettre à MapScreen la région calculée ainsi que les coordonnées individuelles
        navigation.navigate('Carte', { 
          filter: 'byLocality', 
          city: searchQuery, 
          latitude, 
          longitude,
          region: { latitude, longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
        });
      } else {
        Alert.alert("Erreur", "Aucune ville trouvée pour ce nom.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erreur", "Impossible de géocoder cette ville.");
    }
  };

  // 📅 Ouvrir la modale pour entrer une date
  const handleDateSearch = () => {
    setShowDateModal(true);
  };

  // 📅 Valider la date et naviguer vers MapScreen avec le filtre 'date'
  const validateDateAndNavigate = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(selectedDate)) {
      Alert.alert("Format incorrect", "Veuillez entrer une date au format YYYY-MM-DD");
      return;
    }
    setShowDateModal(false);
    navigation.navigate('Carte', { filter: 'date', selectedDate });
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Explorer la ville</Text>

        {/* 📍 Autour de moi */}
        <TouchableOpacity style={styles.filterButton} onPress={handleLocationSearch}>
          <Text style={styles.buttonText}>Autour de moi</Text>
        </TouchableOpacity>

        {/* 🔎 Par localisation */}
        <TouchableOpacity style={styles.filterButton} onPress={handleCitySearch}>
          <Text style={styles.buttonText}>Par localisation</Text>
        </TouchableOpacity>

        {/* 🎭 Par activité */}
        <TouchableOpacity style={styles.filterButton} onPress={() => navigation.navigate('Activity')}>
          <Text style={styles.buttonText}>Par activité</Text>
        </TouchableOpacity>

        {/* 📅 Par date */}
        <TouchableOpacity style={styles.filterButton} onPress={handleDateSearch}>
          <Text style={styles.buttonText}>Par date</Text>
        </TouchableOpacity>
      </View>

      {/* 🔎 Modal pour la recherche de ville */}
      <Modal visible={showModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Rechercher une ville</Text>
            <TextInput 
              style={styles.searchInput}
              placeholder="Entrez une ville..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.modalButtons}>
              <Button title="Annuler" onPress={() => setShowModal(false)} />
              <Button title="Rechercher" onPress={handleCitySearchSubmit} />
            </View>
          </View>
        </View>
      </Modal>

      {/* 📅 Modal pour entrer une date */}
      <Modal visible={showDateModal} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionner une date</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
              value={selectedDate}
              onChangeText={setSelectedDate}
            />
            <View style={styles.modalButtons}>
              <Button title="Annuler" onPress={() => setShowDateModal(false)} />
              <Button title="Valider" onPress={validateDateAndNavigate} />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 26,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'FredokaOne',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 10,
    textAlign: 'center',
  },
  searchInput: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'FredokaOne',
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default ExploreScreen;
