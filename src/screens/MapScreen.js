import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Alert, ActivityIndicator,
  TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';

// Ajustez l'URL de votre backend
const BASE_URL = 'https://backend-city-connect.vercel.app';

export default function MapScreen({ route }) {
  const { 
    filter,
    userLocation, // pour aroundMe, activity, createActivity
    locality,     // pour byLocality { name, latitude, longitude }
    category,     // pour activity
    // Ou lat/ lon / region si vous les transmettez en plus
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

  // -- ACTIVITY MODE --
  const [activities, setActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(
    filter === 'activity' ? category : null
  );

  // -- BY LOCALITY MODE --
  // On affiche un champ de saisie pour taper d'autres coordonnées
  const [showInput, setShowInput] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');

  // -- CREATE ACTIVITY MODE --
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newActivityCoords, setNewActivityCoords] = useState(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityDescription, setNewActivityDescription] = useState('');
  const [activitiesCreated, setActivitiesCreated] = useState([]); 
  // vous pouvez les mélanger dans 'activities' si vous voulez tout afficher ensemble

  /** 
   * On utilise useFocusEffect pour exécuter la logique
   * chaque fois que l'écran redevient actif,
   * selon la valeur de "filter".
   */
  useFocusEffect(
    useCallback(() => {
      if (filter === 'aroundMe') {
        // Récupérer la position de l'utilisateur
        getUserLocation();
        setShowInput(false);
      }
      else if (filter === 'byLocality') {
        // Afficher les inputs, et centrer la carte selon route.params
        handleByLocality();
        setShowInput(true);
      }
      else if (filter === 'activity') {
        // Centrer sur userLocation si dispo, sinon getUserLocation
        handleActivityMode();
        setShowInput(false);
      }
      else if (filter === 'createActivity') {
        // On se centre sur userLocation ou getUserLocation
        handleCreateActivityMode();
        setShowInput(false);
      }
    }, [filter])
  );

  // --------------------------
  // FONCTIONS PAR MODE
  // --------------------------

  /** aroundMe / fallback */
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

  /** byLocality */
  const handleByLocality = () => {
    if (locality && locality.latitude && locality.longitude) {
      // On se centre sur la localité
      setRegion({
        latitude: locality.latitude,
        longitude: locality.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    else if (route.params?.region) {
      // S'il y a un paramètre region
      setRegion(route.params.region);
    }
    else if (route.params?.latitude && route.params?.longitude) {
      // S'il y a lat / lon
      setRegion({
        latitude: route.params.latitude,
        longitude: route.params.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
    else {
      // Sinon on reset à Paris
      setRegion(defaultRegion);
      setLatitudeInput('');
      setLongitudeInput('');
    }
  };

  /** activity */
  const handleActivityMode = async () => {
    if (userLocation) {
      // On se centre sur la localisation transmise
      setRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      // Sinon, fallback
      await getUserLocation();
    }
    // Charger la catégorie initiale si existante
    if (selectedCategory) {
      fetchActivities(selectedCategory);
    }
  };

  /** createActivity */
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
  // GESTION DES ACTIVITES
  // --------------------------
  const fetchActivities = async (cat) => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/activities?category=${cat}`);
      const data = await response.json();
      setActivities(data);
      setLoading(false);
    } catch (error) {
      console.log("Erreur lors du chargement des activités :", error);
      setLoading(false);
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
  // CREATE ACTIVITY
  // --------------------------
  const handleMapPress = (event) => {
    if (filter === 'createActivity') {
      const coords = event.nativeEvent.coordinate;
      setNewActivityCoords(coords);
      setIsCreateModalVisible(true);
    }
  };

  const handleCreateActivity = async () => {
    if (!newActivityCoords || !newActivityTitle.trim()) {
      Alert.alert("Champs manquants", "Veuillez saisir un titre et cliquer sur la carte.");
      return;
    }
    try {
      const resp = await fetch(`${BASE_URL}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newActivityTitle,
          description: newActivityDescription,
          latitude: newActivityCoords.latitude,
          longitude: newActivityCoords.longitude,
          // Ajoutez un "creator" si besoin (ex: userId)
        }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        Alert.alert("Erreur création", errorData.message || "Impossible de créer l'activité");
        return;
      }
      const created = await resp.json();
      // On l'ajoute à la liste
      setActivitiesCreated([...activitiesCreated, created]);
      // Optionnel : vous pouvez aussi l'ajouter à 'activities' si vous voulez la voir en même temps
      // setActivities([...activities, created]);

      setIsCreateModalVisible(false);
      setNewActivityCoords(null);
      setNewActivityTitle('');
      setNewActivityDescription('');
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

  // On combine "activities" et "activitiesCreated" pour l'affichage des marqueurs,
  // si vous le souhaitez.
  const allMarkers = [...activities, ...activitiesCreated];

  return (
    <View style={styles.container}>
      {/* Champs de saisie si mode byLocality */}
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
        onPress={handleMapPress} // Si mode createActivity => ouvre la modale
      >
        {/* Marqueurs pour "activity" ou d'autres modes si on veut afficher tout */}
        {filter === 'activity' && activities.map((act) => (
          <Marker
            key={act._id}
            coordinate={{ latitude: act.latitude, longitude: act.longitude }}
            title={act.title}
            description={act.description}
          />
        ))}

        {/* Marqueurs des activités créées en mode "createActivity" */}
        {filter === 'createActivity' && activitiesCreated.map((act) => (
          <Marker
            key={act._id}
            coordinate={{ latitude: act.latitude, longitude: act.longitude }}
            title={act.title}
            description={act.description}
          />
        ))}

        {/* Marqueur principal : position "courante" ou localité */}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={
            filter === 'byLocality' && locality
              ? locality.name
              : 'Position actuelle'
          }
        />
      </MapView>

      {/* Barre de catégories si mode "activity" */}
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

      {/* Modale pour création d'activité si mode "createActivity" */}
      <Modal
        transparent={true}
        visible={isCreateModalVisible}
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

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#999', marginRight: 10 }]}
                onPress={() => {
                  setIsCreateModalVisible(false);
                  setNewActivityCoords(null);
                  setNewActivityTitle('');
                  setNewActivityDescription('');
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
  // Saisie byLocality
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
  // Barre des catégories
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
  // Modal création
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
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
});
