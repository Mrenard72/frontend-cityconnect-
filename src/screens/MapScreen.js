import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';

// URL du backend
const BASE_URL = 'https://backend-city-connect.vercel.app';




// Fonction pour convertir une chaîne "latitude, longitude" en objet { latitude, longitude }
const parseLocation = (locationStr) => {
  const parts = locationStr.split(',');
  if (parts.length !== 2) return null;
  return {
    latitude: parseFloat(parts[0].trim()),
    longitude: parseFloat(parts[1].trim()),
  };
};

export default function MapScreen({ route }) {

  
  const { 
    filter,
    userLocation, // pour aroundMe, activity, createActivity
    locality,     // pour byLocality { name, latitude, longitude }
    category,     // pour activity
  } = route.params || {};

  // Région par défaut (Paris)
  const defaultRegion = {
    latitude: 48.8566,
    longitude: 2.3522,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState(defaultRegion);
  const [loading, setLoading] = useState(false);
 

  // -- ACTIVITÉS --
  const [activities, setActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    filter === 'activity' ? category : null
  );

  // -- BY LOCALITY --
  const [showInput, setShowInput] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');

  // -- CREATE ACTIVITY --
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newActivityCoords, setNewActivityCoords] = useState(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [newActivityDate, setNewActivityDate] = useState('');
// zone categorie defilante
const [open, setOpen] = useState(false);
const [newActivityCategory, setNewActivityCategory] = useState("sport");
const [categories, setCategories] = useState([
  { label: "Sport", value: "sport" },
  { label: "Sorties", value: "sorties" },
  { label: "Culinaire", value: "culinaire" },
  { label: "Culturel", value: "culturel" },
]);


  const [newActivityMaxParticipants, setNewActivityMaxParticipants] = useState('');
  const [activitiesCreated, setActivitiesCreated] = useState([]);

  // Fonction pour récupérer le token depuis AsyncStorage
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error("Erreur lors de la récupération du token", error);
      return null;
    }
  };

  // Fonction pour réserver une activité (join)
  const handleJoinEvent = async (eventId) => {
    const token = await getToken();
    if (!token) {
        Alert.alert("Erreur", "Veuillez vous reconnecter.");
        return;
    }
    try {
        const response = await fetch(`${BASE_URL}/events/${eventId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (!response.ok) {
            Alert.alert("Erreur", data.message || "Impossible de réserver l'activité.");
        } else {
            Alert.alert("Réservation", "Vous êtes inscrit à l'activité !");
            
            // 🔹 Rediriger l'utilisateur vers la conversation
            if (data.conversation) {
                navigation.navigate('Messaging', { 
                    conversationId: data.conversation._id, 
                    conversationName: data.event.title 
                });
            }
        }
    } catch (error) {
        console.log("Erreur lors de la réservation :", error);
        Alert.alert("Erreur", "Impossible de réserver l'activité.");
    }
  };


  // --------------------------
  // FETCH DES ACTIVITÉS (optionnel : sans filtre ou par catégorie)
  // --------------------------
  const fetchActivities = async (cat) => {
    try {
      setLoading(true);
      let url = `${BASE_URL}/events`;
      if (cat) {
        url += `?category=${cat}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setActivities(data);
      setLoading(false);
    } catch (error) {
      console.log("Erreur lors du chargement des activités :", error);
      setLoading(false);
    }
  };

  // --------------------------
  // LOGIQUE SELON LE MODE (filter)
  // --------------------------
  useFocusEffect(
    useCallback(() => {
      if (filter === 'aroundMe') {
        getUserLocation();
        setShowInput(false);
        fetchActivities(); // récupère toutes les activités
      } else if (filter === 'byLocality') {
        handleByLocality();
        setShowInput(true);
        fetchActivities(); // récupère toutes les activités
      } else if (filter === 'activity') {
        handleActivityMode();
        setShowInput(false);
        if (selectedCategory) {
          fetchActivities(selectedCategory);
        } else {
          fetchActivities();
        }
      } else if (filter === 'createActivity') {
        handleCreateActivityMode();
        setShowInput(false);
      }
    }, [filter])
  );

  // --------------------------
  // FONCTIONS PAR MODE
  // --------------------------
  const getUserLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Activez la localisation pour voir votre position.');
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
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

  const handleByLocality = () => {
    if (locality && locality.latitude && locality.longitude) {
      setRegion({
        latitude: locality.latitude,
        longitude: locality.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else if (route.params?.region) {
      setRegion(route.params.region);
    } else if (route.params?.latitude && route.params?.longitude) {
      setRegion({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      setRegion(defaultRegion);
      setLatitudeInput('');
      setLongitudeInput('');
    }
  };

  const handleActivityMode = async () => {
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
  };

  const handleCreateActivityMode = async () => {
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
  };

  // --------------------------
  // Saisie manuelle (byLocality)
  // --------------------------
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
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  // --------------------------
  // GESTION DE LA CRÉATION D'ACTIVITÉ
  // --------------------------
  const handleMapPress = (event) => {
    if (filter === 'createActivity') {
      const coords = event.nativeEvent.coordinate;
      setNewActivityCoords(coords);
      setIsCreateModalVisible(true);
    }
  };

  const handleCreateActivity = async () => {
    // Vérification de tous les champs requis
    if (
      !newActivityCoords ||
      !newActivityTitle.trim() ||
      !newActivityDescription.trim() ||
      !newActivityDate.trim() ||
      !newActivityCategory.trim() ||
      !newActivityMaxParticipants.trim()
    ) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs et cliquer sur la carte pour définir la localisation.");
      return;
    }
    
    // Récupération du token depuis AsyncStorage
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Aucun token trouvé. Veuillez vous reconnecter.");
      return;
    }
    
    // Conversion de la date saisie en format ISO
    const isoDate = new Date(newActivityDate).toISOString();
    
    console.log("newActivityCoords:", newActivityCoords);
    
    // Construction du payload attendu par le backend
    const payload = {
      title: newActivityTitle,
      description: newActivityDescription,
      location: `${newActivityCoords.latitude}, ${newActivityCoords.longitude}`,
      date: isoDate,
      category: newActivityCategory,
      maxParticipants: parseInt(newActivityMaxParticipants, 10),
      photos: [] // Tableau vide par défaut
    };

    console.log("Payload envoyé:", payload);

    try {
      const resp = await fetch(`${BASE_URL}/events`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        Alert.alert("Erreur création", errorData.message || "Impossible de créer l'activité");
        return;
      }
      const created = await resp.json();
      // Ajout de l'événement créé à la liste
      setActivitiesCreated([...activitiesCreated, created.event]);
      setIsCreateModalVisible(false);
      setNewActivityCoords(null);
      setNewActivityTitle('');
      setNewActivityDescription('');
      setNewActivityDate('');
      setNewActivityCategory('');
      setNewActivityMaxParticipants('');
      Alert.alert("Activité créée", "Votre activité a bien été créée !");
    } catch (err) {
      console.log("Erreur création activité:", err);
      Alert.alert("Erreur", "Impossible de créer l'activité.");
    }
  };

  // --------------------------
  // RENDER
  // --------------------------
  if (loading) {
    return <ActivityIndicator size="large" color="#2D2A6E" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Saisie manuelle (byLocality) */}
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
        {/* Marqueurs pour les modes d'exploration */}
        {(filter === 'activity' || filter === 'aroundMe' || filter === 'byLocality') && activities.map((act) => {
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
                  "Réserver l'activité",
                  "Voulez-vous vous inscrire à cette activité ?",
                  [
                    { text: "Annuler", style: "cancel" },
                    { text: "Réserver", onPress: () => handleJoinEvent(act._id) }
                  ]
                );
              }}
            />
          );
        })}

        {/* Marqueurs pour les activités créées (mode createActivity) */}
        {filter === 'createActivity' && activitiesCreated.map((act) => {
          const coords = parseLocation(act.location);
          if (!coords) return null;
          return (
            <Marker
              key={act._id}
              coordinate={coords}
              title={act.title}
              description={act.description}
            />
          );
        })}

        {/* Marqueur principal : position actuelle ou localité */}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={filter === 'byLocality' && locality ? locality.name : 'Position actuelle'}
        />
      </MapView>

      {/* Barre de catégories en mode "activity" */}
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

      {/* Modale de création d'activité en mode "createActivity" */}
      <Modal
        transparent={true}
        visible={isCreateModalVisible}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Créer une activité</Text>
           <TextInput
  style={[styles.modalInput, { color: '#2D2A6E' }]} // Appliquer la couleur bleue
  placeholder="Titre"
  placeholderTextColor="#2D2A6E"
  value={newActivityTitle}
  onChangeText={setNewActivityTitle}
/>
<TextInput
  style={[styles.modalInput, { height: 70, color: '#2D2A6E' }]} // Pour texte bleu et multiline
  multiline
  placeholder="Description"
  placeholderTextColor="#2D2A6E"
  value={newActivityDescription}
  onChangeText={setNewActivityDescription}
/>
<TextInput
  style={[styles.modalInput, { color: '#2D2A6E' }]}
  placeholder="Date (YYYY-MM-DD)"
  placeholderTextColor="#2D2A6E"
  value={newActivityDate}
  onChangeText={setNewActivityDate}
/>
{/* zone roulante dans la creation de l'activité */}
<DropDownPicker
  open={open}
  value={newActivityCategory}
  items={categories}
  placeholder="Catégorie" 
  setOpen={setOpen}
  setValue={setNewActivityCategory}
  setItems={setCategories}
  style={styles.dropdown}
  dropDownContainerStyle={styles.dropdownContainer}
/>

<TextInput
  style={[styles.modalInput, { color: '2D2A6E' }]}
  placeholder="Max. Participants"
  placeholderTextColor="#2D2A6E"
  value={newActivityMaxParticipants}
  onChangeText={setNewActivityMaxParticipants}
  keyboardType="numeric"
/>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999', marginRight: 10 }]}
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
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Saisie manuelle (byLocality)
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
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginRight: 10,
    color: '#2D2A6E',
  },
  button: {
    backgroundColor: '#2D2A6E',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  buttonText: { 
    color: '#fff',
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  // Barre de catégories
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
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: '#ccc',
  },
  activeButton: { backgroundColor: '#2D2A6E' },
  categoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Styles de la modale de création
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 10,
  },
  
  modalInput: {
    borderWidth: 2,
    borderColor: '#2D2A6E',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
    color: '#2D2A6E',
   
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  dropdown: {
    borderWidth: 2,
    borderColor: '#2D2A6E',
    borderRadius: 8,
    backgroundColor: '#FFF',
    marginVertical: 8,
    color: '#2D2A6E',
    zIndex: 1000, // Pour éviter qu'il soit caché par d'autres éléments
  },
  dropdownContainer: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#2D2A6E',
    color: '#2D2A6E',
    zIndex: 1000, // Priorité sur les autres éléments
  }
  
  
  
});
