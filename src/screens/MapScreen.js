import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-city-connect.vercel.app';
const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dasntwyhd/image/upload';
const UPLOAD_PRESET = 'default_preset';

// Fonction pour parser les coordonnées de localisation
function parseLocation(locationStr) {
  if (!locationStr) return null;
  const parts = locationStr.split(',');
  if (parts.length !== 2) return null;
  return {
    latitude: parseFloat(parts[0]),
    longitude: parseFloat(parts[1]),
  };
}

// Composant pour la modale de création d'activité
const CreateActivityModal = ({ visible, onClose, onCreate, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "Vous devez autoriser l'accès à la galerie pour sélectionner une image.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log("Résultat de la sélection d'image :", result); // Log pour déboguer

      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image :", error); // Log pour déboguer
      Alert.alert("Erreur", "Impossible de sélectionner une image.");
    }
  };

  const handleCreate = () => {
    onCreate({ title, description, date, category, maxParticipants, photoUri });
  };

  const handleDayPress = (day) => {
    setDate(new Date(day.dateString));
    setCalendarVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Créer une activité</Text>
          <TextInput style={styles.modalInput} placeholder="Titre" value={title} onChangeText={setTitle} />
          <TextInput style={[styles.modalInput, { height: 70 }]} multiline placeholder="Description" value={description} onChangeText={setDescription} />
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Choisir une image</Text>
          </TouchableOpacity>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.imagePreview} />}
          <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.datePickerButton}>
            <Text style={styles.buttonText}>Choisir une date</Text>
          </TouchableOpacity>
          {isCalendarVisible && (
            <Calendar
              onDayPress={handleDayPress}
              markedDates={{
                [date.toISOString().split('T')[0]]: { selected: true, selectedColor: '#2D2A6E' },
              }}
            />
          )}
          <TextInput style={styles.modalInput} placeholder="Catégorie" value={category} onChangeText={setCategory} />
          <TextInput style={styles.modalInput} placeholder="Max participants" keyboardType="numeric" value={maxParticipants} onChangeText={setMaxParticipants} />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#999', marginRight: 10 }]} onPress={onClose}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, { backgroundColor: '#2D2A6E' }]} onPress={handleCreate} disabled={loading}>
              <Text style={styles.buttonText}>Créer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Composant principal MapScreen
export default function MapScreen({ route, navigation }) {
  const { filter, userLocation, category, locality } = route.params || {};

  // Région par défaut (Paris)
  const defaultRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState(defaultRegion);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [activitiesCreated, setActivitiesCreated] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(filter === 'activity' ? category : null);
  const [showInput, setShowInput] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newActivityCoords, setNewActivityCoords] = useState(null);

  // Récupérer le token
  async function getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch {
      return null;
    }
  }

  // Rejoindre un événement
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
        },
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert("Erreur", data.message || "Impossible de réserver");
        return;
      }
      if (data.conversation) {
        navigation.navigate('Messagerie', {
          screen: 'Messaging',
          params: {
            conversationId: data.conversation._id,
            conversationName: data.conversation.eventId?.title || "Conversation",
          },
        });
      } else {
        Alert.alert("Réservation", "Vous êtes inscrit à l'événement !");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Erreur", "Impossible de réserver.");
    }
  }

  // Charger les activités
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

  // Gérer la localisation de l'utilisateur
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

  // Recentrer la carte manuellement
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

  // Gérer le clic sur la carte
  function handleMapPress(e) {
    if (filter === 'createActivity') {
      const { coordinate } = e.nativeEvent;
      setNewActivityCoords(coordinate);
      setIsCreateModalVisible(true);
    }
  }

  // Créer une activité
  const handleCreateActivity = async (activityData) => {
    const { title, description, date, category, maxParticipants, photoUri } = activityData;
    if (!newActivityCoords || !title || !description || !category || !maxParticipants) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté");
      return;
    }
    let photoUrl = null;
    if (photoUri) {
      photoUrl = await uploadImage(photoUri);
    }
    const payload = {
      title,
      description,
      location: `${newActivityCoords.latitude}, ${newActivityCoords.longitude}`,
      date: date.toISOString(),
      category,
      maxParticipants: parseInt(maxParticipants, 10),
      photos: photoUrl ? [photoUrl] : [],
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
        Alert.alert("Erreur", data.message || "Impossible de créer");
        return;
      }
      setIsCreateModalVisible(false);
      setNewActivityCoords(null);
      setActivitiesCreated([...activitiesCreated, data]);
      Alert.alert("Succès", "Activité créée !");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer l'activité");
    }
    setLoading(false);
  };

  // Téléverser une image sur Cloudinary
  const uploadImage = async (uri) => {
    let formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'activity.jpg' });
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.secure_url;
  };

  // Effet de focus pour gérer les modes
  useFocusEffect(
    useCallback(() => {
      if (filter === 'aroundMe') {
        getUserLocation();
        setShowInput(false);
        fetchActivities();
      } else if (filter === 'byLocality') {
        setShowInput(true);
        handleByLocality();
        fetchActivities();
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

  // Gérer le mode "byLocality"
  function handleByLocality() {
    if (locality?.latitude && locality?.longitude) {
      setRegion({
        latitude: locality.latitude,
        longitude: locality.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      setRegion(defaultRegion);
      setLatitudeInput('');
      setLongitudeInput('');
    }
  }

  // Gérer le mode "activity"
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

  // Gérer le mode "createActivity"
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

  // Fusionner les marqueurs
  let allMarkers = [];
  if (filter === 'createActivity') {
    allMarkers = [
      ...activitiesCreated,
      ...activities.filter(a => !activitiesCreated.some(c => c._id === a._id)),
    ];
  } else {
    allMarkers = activities;
  }

  if (loading) {
    return <ActivityIndicator size="large" color="#2D2A6E" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
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

      <MapView style={styles.map} region={region} onPress={handleMapPress}>
        {allMarkers.map((act) => {
          if (!act.location) return null;
          const coords = parseLocation(act.location);
          if (!coords) return null;
          return (
            <Marker
              key={act._id}
              coordinate={coords}
              title={act.title}
              description={act.description}
              onCalloutPress={() => {
                Alert.alert(
                  "Réserver l'activité ?",
                  `Voulez-vous vous inscrire à: ${act.title} ?`,
                  [
                    { text: 'Annuler', style: 'cancel' },
                    { text: 'OK', onPress: () => handleJoinEvent(act._id) },
                  ]
                );
              }}
            />
          );
        })}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={filter === 'byLocality' && locality ? locality.name : 'Position actuelle'}
          pinColor="blue"
        />
      </MapView>

      {filter === 'activity' && (
        <View style={styles.categoryBar}>
          {['Sport', 'Culturel', 'Sorties', 'Culinaire'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.activeButton,
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

      <CreateActivityModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreate={handleCreateActivity}
        loading={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  inputContainer: {
    position: 'absolute',
    top: 70,
    left: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 8,
    zIndex: 100,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCC',
    marginRight: 5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#2D2A6E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  buttonText: { color: '#FFF', fontWeight: 'bold' },
  categoryBar: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  categoryButton: { backgroundColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  activeButton: { backgroundColor: '#2D2A6E' },
  categoryText: { color: '#FFF', fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '85%', backgroundColor: '#FFF', padding: 20, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalInput: { borderWidth: 1, borderColor: '#CCC', borderRadius: 8, padding: 10, marginVertical: 5 },
  imagePickerButton: { backgroundColor: '#2D2A6E', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
  imagePreview: { width: '100%', height: 200, borderRadius: 8, marginVertical: 10 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  datePickerButton: { backgroundColor: '#2D2A6E', padding: 10, borderRadius: 8, alignItems: 'center', marginVertical: 5 },
});