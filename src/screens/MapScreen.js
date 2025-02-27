import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

export default function MapScreen({ route }) {
  const { filter } = route.params || {};

  // 🔹 Région par défaut : Paris, zoom plus serré (0.01)
  const defaultRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState(defaultRegion);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [showInput, setShowInput] = useState(false);

  // 🔎 Pour debug
  console.log("[MapScreen] filter =", filter);

  // useFocusEffect : déclenché à chaque fois que l'écran redevient actif
  useFocusEffect(
    useCallback(() => {
      console.log("🔎 useFocusEffect triggered. Filter =", filter);

      if (filter === 'aroundMe') {
        getUserLocation();   // Récupérer la position GPS
        setShowInput(false); // Cacher l'input
      }
      else if (filter === 'byLocality') {
        // Si une région a été transmise, on l'utilise
        if (route.params && route.params.region) {
          console.log("🔎 Setting region from params:", route.params.region);
          setRegion(route.params.region);
        }
        // Sinon, si latitude et longitude sont fournis, on les utilise
        else if (route.params && route.params.latitude && route.params.longitude) {
          console.log("🔎 Setting region from lat/lon:", route.params.latitude, route.params.longitude);
          setRegion({
            latitude: route.params.latitude,
            longitude: route.params.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        } else {
          resetToParis(); // Sinon, on réinitialise à Paris
        }
        setShowInput(true);  // Afficher l'input pour permettre une recherche ultérieure
      }
      else if (filter === 'activity') {
        fetchActivities();   // Charger les activités
        setShowInput(false); // Cacher l'input
      }
    }, [filter])
  );

  // 🔥 Récupérer la position GPS
  const getUserLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation pour voir votre position.');
        setLoading(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log("📍 local coords:", location.coords);

      // Zoom plus serré pour voir le déplacement
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d’obtenir votre position.');
      console.log(error);
    }
    setLoading(false);
  };

  // 🔄 Revenir à Paris
  const resetToParis = () => {
    console.log("🔄 resetToParis");
    setRegion(defaultRegion);
    setLatitudeInput('');
    setLongitudeInput('');
  };

  // 📌 Récupérer les activités
  const fetchActivities = async () => {
    try {
      const response = await fetch('https://backend-city-connect.vercel.app/activities');
      const data = await response.json();
      setActivities(data);
      console.log("🔎 Activities loaded:", data.length);
    } catch (error) {
      console.log("Erreur lors du chargement des activités :", error);
    }
  };

  // 🎯 Recentrer la carte selon les inputs
  const handleRecenterMap = () => {
    const lat = parseFloat(latitudeInput);
    const lon = parseFloat(longitudeInput);
    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert('Coordonnées invalides', 'Veuillez saisir des valeurs numériques.');
      return;
    }
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {/* Affichage du champ pour entrer des coordonnées (uniquement 'byLocality') */}
      {showInput && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
          style={styles.inputContainer}
        >
          <TextInput
            style={styles.input}
            placeholder="Latitude"
            keyboardType="numeric"
            value={latitudeInput}
            onChangeText={setLatitudeInput}
          />
          <TextInput
            style={styles.input}
            placeholder="Longitude"
            keyboardType="numeric"
            value={longitudeInput}
            onChangeText={setLongitudeInput}
          />
          <TouchableOpacity style={styles.button} onPress={handleRecenterMap}>
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      <MapView
        style={styles.map}
        region={region}   // ⚠️ On utilise region (mode contrôlé)
        // onRegionChangeComplete={setRegion} // ← Commenté pour éviter d'écraser la région
      >
        {/* Affiche les marqueurs si on est en mode "activity" */}
        {filter === 'activity' && activities.map((activity) => (
          <Marker
            key={activity._id}
            coordinate={{
              latitude: activity.location.latitude,
              longitude: activity.location.longitude,
            }}
            title={activity.title}
            description={activity.description}
          />
        ))}

        {/* Marqueur de la position "courante" */}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title="Position actuelle"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 80 : 60,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
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
  button: {
    backgroundColor: '#2D2A6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
