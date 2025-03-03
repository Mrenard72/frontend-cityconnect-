import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-city-connect.vercel.app';

function parseLocation(locationStr) {
  const parts = locationStr.split(',');
  if (parts.length !== 2) return null;
  return {
    latitude: parseFloat(parts[0]),
    longitude: parseFloat(parts[1]),
  };
}

export default function MapScreen({ route, navigation }) {
  const { filter, userLocation, category, locality } = route.params || {};

  // Région par défaut (Paris)
  const defaultRegion = {
    latitude: 48.8566, longitude: 2.3522,
    latitudeDelta: 0.01, longitudeDelta: 0.01,
  };
  const [region, setRegion] = useState(defaultRegion);
  const [loading, setLoading] = useState(false);

  const [activities, setActivities] = useState([]);
  const [activitiesCreated, setActivitiesCreated] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    filter === 'activity' ? category : null
  );

  // --- Champs pour "byLocality"
  const [showInput, setShowInput] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');

  // --- Modale de création
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newActivityCoords, setNewActivityCoords] = useState(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityDate, setNewActivityDate] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState('');
  const [newActivityMaxParticipants, setNewActivityMaxParticipants] = useState('');

  // 1. Récupère le token
  async function getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch {
      return null;
    }
  }

  // 2. Rejoindre un event
  async function handleJoinEvent(eventId) {
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Token manquant, reconnectez-vous.");
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Erreur", data.message || "Impossible de réserver");
        return;
      }
      // On a data.conversation => on redirige vers la messagerie
      if (data.conversation) {
        navigation.navigate('Messagerie', {
          screen: 'Messaging',
          params: {
            conversationId: data.conversation._id,
            conversationName: data.conversation.eventId?.title || "Conversation",
          }
        });
      } else {
        Alert.alert("Réservation", "Vous êtes inscrit à l'événement !");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de réserver.");
    }
  }

  // 3. Charger la liste des events
  async function fetchActivities(cat) {
    try {
      setLoading(true);
      let url = `${BASE_URL}/events`;
      if (cat) url += `?category=${cat}`;
      const res = await fetch(url);
      const data = await res.json();
      setActivities(data);
    } catch (err) {
      console.log("Erreur fetchEvents:", err);
    } finally {
      setLoading(false);
    }
  }

  // 4. useFocusEffect -> switch sur filter
  useFocusEffect(
    useCallback(() => {
      if (filter === 'aroundMe') {
        getUserLocation();
        setShowInput(false);
        fetchActivities(); // tout
      } else if (filter === 'byLocality') {
        setShowInput(true);
        handleByLocality();
        fetchActivities(); // tout
      } else if (filter === 'activity') {
        setShowInput(false);
        handleActivityMode();
        if (selectedCategory) {
          fetchActivities(selectedCategory);
        } else {
          fetchActivities();
        }
      } else if (filter === 'createActivity') {
        setShowInput(false);
        handleCreateActivityMode();
      }
    }, [filter])
  );

  // Fonctions par mode
  async function getUserLocation() {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Activez la localisation");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  function handleByLocality() {
    if (locality?.latitude && locality?.longitude) {
      setRegion({
        latitude: locality.latitude,
        longitude: locality.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      // fallback sur Paris
      setRegion(defaultRegion);
      setLatitudeInput('');
      setLongitudeInput('');
    }
  }

  async function handleActivityMode() {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      await getUserLocation();
    }
  }

  async function handleCreateActivityMode() {
    if (userLocation) {
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      await getUserLocation();
    }
  }

  // 5. Recentrage manuel (byLocality)
  function handleRecenterMap() {
    const lat = parseFloat(latitudeInput);
    const lon = parseFloat(longitudeInput);
    if (isNaN(lat) || isNaN(lon)) {
      Alert.alert("Erreur", "Coordonnées invalides");
      return;
    }
    setRegion({
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  }

  // 6. handleMapPress -> ouvre modale
  function handleMapPress(e) {
    if (filter === 'createActivity') {
      const { coordinate } = e.nativeEvent;
      setNewActivityCoords(coordinate);
      setIsCreateModalVisible(true);
    }
  }

  // 7. Créer une activité
  async function handleCreateActivity() {
    if (!newActivityCoords ||
        !newActivityTitle ||
        !newActivityDescription ||
        !newActivityDate ||
        !newActivityCategory ||
        !newActivityMaxParticipants) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs");
      return;
    }
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }
    const isoDate = new Date(newActivityDate).toISOString();
    const payload = {
      title: newActivityTitle,
      description: newActivityDescription,
      location: `${newActivityCoords.latitude}, ${newActivityCoords.longitude}`,
      date: isoDate,
      category: newActivityCategory,
      maxParticipants: parseInt(newActivityMaxParticipants, 10),
      photos: []
    };
    try {
      const res = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Erreur création", data.message || "Impossible de créer");
        return;
      }
      // data.event => on l'ajoute dans activitiesCreated
      setActivitiesCreated(prev => [...prev, data.event]);
      setIsCreateModalVisible(false);
      // Reset
      setNewActivityCoords(null);
      setNewActivityTitle('');
      setNewActivityDescription('');
      setNewActivityDate('');
      setNewActivityCategory('');
      setNewActivityMaxParticipants('');
      Alert.alert("Succès", "Activité créée !");
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de créer");
    }
  }

  // 8. Unifier l’affichage des marqueurs
  // Si on est en createActivity, on veut voir *aussi* ceux existants + ceux créés
  let allMarkers = [];
  if (filter === 'createActivity') {
    // Fusionne en évitant les doublons : 
    allMarkers = [
      ...activitiesCreated,
      ...activities.filter(a => !activitiesCreated.some(c => c._id === a._id))
    ];
  } else {
    // juste la liste "activities"
    allMarkers = activities;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#2D2A6E" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      {/* byLocality => inputs lat/lon */}
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
        region={region}
        onPress={handleMapPress}
      >
        {/* Rendu de tous les marqueurs unifiés */}
        {allMarkers.map((act) => {
          const coords = parseLocation(act.location);
          if (!coords) return null;
          return (
            <Marker
              key={act._id}
              coordinate={coords}
              title={act.title}
              description={act.description}
              onCalloutPress={() => {
                // Si on est en "activity" ou "aroundMe", propose de join
                Alert.alert(
                  "Réserver l'activité ?",
                  `Voulez-vous vous inscrire à: ${act.title} ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'OK', onPress: () => handleJoinEvent(act._id) }
                  ]
                );
              }}
            />
          );
        })}

        {/* Marqueur principal (user ou localité) */}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={filter === 'byLocality' && locality ? locality.name : 'Position actuelle'}
          pinColor="blue"
        />
      </MapView>

      {/* Barre de catégories si filter === 'activity' */}
      {filter === 'activity' && (
        <View style={styles.categoryBar}>
          {['Sport','Culturel','Sorties','Culinaire'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.activeButton
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                fetchActivities(cat);
              }}
            >
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Modal création si createActivity */}
      <Modal
        visible={isCreateModalVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Créer une activité</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Titre"
              value={newActivityTitle}
              onChangeText={setNewActivityTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              multiline
              placeholder="Description"
              value={newActivityDescription}
              onChangeText={setNewActivityDescription}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Date (YYYY-MM-DD)"
              value={newActivityDate}
              onChangeText={setNewActivityDate}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Catégorie"
              value={newActivityCategory}
              onChangeText={setNewActivityCategory}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Max participants"
              keyboardType="numeric"
              value={newActivityMaxParticipants}
              onChangeText={setNewActivityMaxParticipants}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999', marginRight:10 }]}
                onPress={() => {
                  setIsCreateModalVisible(false);
                  setNewActivityCoords(null);
                  setNewActivityTitle('');
                  setNewActivityDescription('');
                  setNewActivityDate('');
                  setNewActivityCategory('');
                  setNewActivityMaxParticipants('');
                }}
              >
                <Text style={styles.buttonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2D2A6E' }]}
                onPress={handleCreateActivity}
              >
                <Text style={styles.buttonText}>Créer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputContainer: {
    position: 'absolute', top: 70, left: 10, right: 10,
    flexDirection: 'row', backgroundColor: '#FFF',
    padding: 8, borderRadius: 8, zIndex: 100,
  },
  input: {
    flex:1, borderWidth:1, borderColor:'#CCC', marginRight:5, borderRadius:8, paddingHorizontal:8,
  },
  button: {
    backgroundColor:'#2D2A6E', borderRadius:8, paddingHorizontal:10, paddingVertical:8
  },
  buttonText: { color:'#FFF', fontWeight:'bold' },

  categoryBar: {
    position:'absolute', bottom:20, left:10, right:10,
    flexDirection:'row', justifyContent:'space-around',
    backgroundColor:'rgba(255,255,255,0.9)', paddingVertical:10, borderRadius:10,
  },
  categoryButton: { backgroundColor:'#ccc', paddingVertical:8, paddingHorizontal:12, borderRadius:5 },
  activeButton: { backgroundColor:'#2D2A6E' },
  categoryText: { color:'#FFF', fontWeight:'bold' },

  modalOverlay: {
    flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'
  },
  modalContainer: {
    width:'85%', backgroundColor:'#FFF', padding:20, borderRadius:8
  },
  modalTitle: {
    fontSize:18, fontFamily:'FredokaOne', color:'#2D2A6E', marginBottom:10
  },
  modalInput: {
    borderWidth:1, borderColor:'#CCC', borderRadius:8, padding:10, marginVertical:5
  },
  modalButtons: {
    flexDirection:'row', justifyContent:'flex-end', marginTop:10
  }
});
