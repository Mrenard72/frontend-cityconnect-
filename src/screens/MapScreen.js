import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

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

// Modale pour créer une nouvelle activité
const CreateActivityModal = ({ visible, onClose, onCreate, loading }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [category, setCategory] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [isCalendarVisible, setCalendarVisible] = useState(false);
  const [openCategory, setOpenCategory] = useState(false);
  const [items, setItems] = useState([
    { label: 'Sport', value: 'Sport' },
    { label: 'Culturel', value: 'Culturel' },
    { label: 'Sorties', value: 'Sorties' },
    { label: 'Culinaire', value: 'Culinaire' },
  ]);

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
      console.log("Résultat de la sélection d'image :", result);
      if (!result.canceled) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image :", error);
      Alert.alert("Erreur", "Impossible de sélectionner une image.");
    }
  };

  const handleCreate = () => {
    if (!title || !description || !date || !category || !maxParticipants) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    const formattedDate = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
    console.log("📤 Données envoyées par handleCreate :", {
      title,
      description,
      date: formattedDate,
      category,
      maxParticipants,
      photoUri,
    });
    onCreate({ title, description, date: formattedDate, category, maxParticipants, photoUri });
  };

  const handleDayPress = (day) => {
    const newDate = new Date(day.dateString);
    setSelectedDate(newDate);
    const formattedDate = newDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setDate(formattedDate);
    setCalendarVisible(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Créer une activité</Text>
          <TextInput
            style={styles.modalInput}
            placeholder="Titre"
            placeholderTextColor="#666"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.modalInput, { height: 70 }]}
            multiline
            placeholder="Description"
            placeholderTextColor="#666"
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.buttonText}>Choisir une image</Text>
              <FontAwesome5 name="image" size={16} color="#FFF" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.imagePreview} />}
          <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.datePickerButton}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.buttonText}>
                {date ? ` ${date}` : "Choisir une date"}
              </Text>
              <FontAwesome5 name="calendar" size={16} color="#FFF" style={{ marginLeft: 8 }} />
            </View>
          </TouchableOpacity>
          {isCalendarVisible && (
            <Calendar
              onDayPress={handleDayPress}
              markedDates={
                selectedDate
                  ? { [selectedDate.toISOString().split('T')[0]]: { selected: true, selectedColor: '#2D2A6E' } }
                  : {}
              }
            />
          )}
          <View style={{ zIndex: 3000, marginBottom: 10 }}>
            <DropDownPicker
              open={openCategory}
              value={category}
              items={items}
              setOpen={setOpenCategory}
              setValue={setCategory}
              setItems={setItems}
              placeholder="Sélectionner une catégorie"
              style={{ borderColor: '#CCC' }}
              dropDownContainerStyle={{ backgroundColor: '#FFF' }}
            />
          </View>
          <TextInput
            style={styles.modalInput}
            placeholder="Max participants"
            keyboardType="numeric"
            value={maxParticipants}
            onChangeText={setMaxParticipants}
          />
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

// Modale pour afficher les détails d'une activité
const ActivityDetailsModal = ({ activity, onClose, onJoin }) => {
  const navigation = useNavigation();
  if (!activity) return null;
  return (
    <Modal visible={!!activity} transparent animationType="fade">
      <View style={styles.activityModal_overlay}>
        <View style={styles.activityModal_container}>
          <Text style={styles.activityModal_title}>{activity.title}</Text>
          <Text style={styles.activityModal_description}>{activity.description}</Text>
          {activity.photos && activity.photos.length > 0 ? (
            <Image source={{ uri: activity.photos[0] }} style={styles.activityModal_imagePreview} />
          ) : (
            <Text style={styles.activityModal_noImageText}>Aucune image disponible</Text>
          )}
          <View style={styles.activityModal_infoRow}>
            <Text style={styles.activityModal_infoText}>
              📅 {activity.date ? new Date(activity.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }) : "Date non définie"}
            </Text>
            <Text style={styles.activityModal_infoText}>
              👥 {activity.participants ? activity.participants.length : 0}/{activity.maxParticipants || '∞'}
            </Text>
          </View>
          <View style={styles.activityModal_buttons}>
            <TouchableOpacity
              style={styles.activityModal_joinButton}
              onPress={() => {
                onJoin(activity._id);
                onClose();
                Alert.alert("Inscription réussie !", "Vous êtes maintenant inscrit.");
              }}
            >
              <Text style={styles.activityModal_buttonText}>Rejoindre</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.activityModal_closeButton}
              onPress={onClose}
            >
              <Text style={styles.activityModal_buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => {
              navigation.navigate('Profil', { screen: 'UserProfileScreen' });
              onClose();
            }}
          >
            <Text style={styles.profileButtonText}>Voir Profil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Fonction pour gérer le mode création d'activité
async function handleCreateActivityMode(userLocation, setRegion, getUserLocation) {
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

// Composant principal MapScreen
export default function MapScreen({ route, navigation }) {
  const { filter, userLocation, category, locality, selectedDate } = route.params || {};
  const defaultRegion = {
    latitude: 46.603354, // Centre de la France
  longitude: 1.888334,
  latitudeDelta: 6, // Grand zoom out
  longitudeDelta: 6,
  };

  const [region, setRegion] = useState(defaultRegion);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(filter === 'activity' ? category : null);
  const [showInput, setShowInput] = useState(false);
  const [latitudeInput, setLatitudeInput] = useState('');
  const [longitudeInput, setLongitudeInput] = useState('');
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newActivityCoords, setNewActivityCoords] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

// recuperation des activites par dates

async function fetchActivitiesByDate(date) {
  setLoading(true); // Active le chargement
  try {
    const response = await fetch(`${BASE_URL}/events?date=${date}`); // 🔗 Modifie cette URL si besoin
    const data = await response.json(); 
    const filteredActivities = data.filter(act => {
      const activityDate = act.date.split('T')[0]; // 🔥 Garde juste YYYY-MM-DD
      return activityDate === date;
    });
    
    setActivities(filteredActivities);
    console.log("🎯 Activités après filtrage :", filteredActivities);
    
    console.log("📅 Activités récupérées pour", date, ":", data); // Vérification console
  } catch (err) {
    console.error("❌ Erreur lors de la récupération des activités :", err);
  } finally {
    setLoading(false); // Désactive le chargement
  }
}

useEffect(() => {
  if (selectedDate) {
    fetchActivitiesByDate(selectedDate); // 🔥 Appelle la fonction dès que selectedDate change
  }
}, [selectedDate]);



  async function getToken() {
    try {
      return await AsyncStorage.getItem('token');
    } catch {
      return null;
    }
  }

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

  useEffect(() => {
    if (filter === 'activity') {
      fetchActivities(selectedCategory);
    }
  }, [selectedCategory, filter]);

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

  function handleMapPress(e) {
    if (filter === 'createActivity') {
      const { coordinate } = e.nativeEvent;
      setNewActivityCoords(coordinate);
      setIsCreateModalVisible(true);
    }
  }

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
      console.log("📤 Upload de l'image...");
      photoUrl = await uploadImage(photoUri);
      if (!photoUrl) {
        Alert.alert("Erreur", "Échec de l'upload de l'image.");
        setLoading(false);
        return;
      }
    }
    const payload = {
      title,
      description,
      location: `${newActivityCoords.latitude}, ${newActivityCoords.longitude}`,
      date,
      category,
      maxParticipants: parseInt(maxParticipants, 10),
      photos: photoUrl ? [photoUrl] : [],
    };
    console.log("📤 Données envoyées au backend :", JSON.stringify(payload, null, 2));
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
      console.log("📩 Réponse du backend :", data);
      if (!res.ok) {
        Alert.alert("Erreur", data.message || "Impossible de créer");
        setLoading(false);
        return;
      }
      setIsCreateModalVisible(false);
      setNewActivityCoords(null);
      Alert.alert("Succès", "Activité créée !");
    } catch (error) {
      console.error("❌ Erreur lors de la création :", error);
      Alert.alert("Erreur", "Impossible de créer l'activité");
    }
    setLoading(false);
  };

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

  useFocusEffect(
    useCallback(() => {
      if (filter === 'aroundMe') {
        getUserLocation().then(() => {
          fetchActivities();
        });
      } else if (filter === 'activity') {
        getUserLocation().then(() => {
          const categoryToUse = selectedCategory || 'Sport';
          setSelectedCategory(categoryToUse);
          fetchActivities(categoryToUse);
        });
      } else if (filter === 'byLocality') {
        setShowInput(true);
        handleByLocality();
        fetchActivities();
      } else if (filter === 'createActivity') {
        setShowInput(false);
        handleCreateActivityMode(userLocation, setRegion, getUserLocation);
      }
    }, [filter, selectedCategory])
  );
  
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

  async function handleCreateActivityMode(userLocation, setRegion, getUserLocation) {
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

  let allMarkers = activities;  
  if (loading) {
    return <ActivityIndicator size="large" color="#2D2A6E" style={{ marginTop: 50 }} />;
  }

  const categoryIcons = {
    Sport: require('../../assets/Iconsport.png'),
    Culturel: require('../../assets/Iconculturel.png'),
    Sorties: require('../../assets/Iconsortie.png'),
    Culinaire: require('../../assets/Iconculinaire.png'),
  };

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
              onPress={() => setSelectedActivity(act)}
            >
              <Image
                source={categoryIcons[act.category]}
                style={{ width: 40, height: 40, resizeMode: 'contain' }}
              />
            </Marker>
          );
        })}
        <Marker
          coordinate={{ latitude: region.latitude, longitude: region.longitude }}
          title={filter === 'byLocality' && locality ? locality.name : 'Position actuelle'}
          pinColor="blue"
        />
      </MapView>

      {selectedActivity && (
        <ActivityDetailsModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onJoin={handleJoinEvent}
        />
      )}

      {filter === 'activity' && (
        <View style={styles.categoryBar}>
          {['Sport', 'Culturel', 'Sorties', 'Culinaire'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                selectedCategory === cat && styles.activeButton,
              ]}
              onPress={() => setSelectedCategory(cat)}
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
  textInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 5,
    color: '#000',
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
  dropdownContainer: { zIndex: 2000 },
  activityModal_overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  activityModal_container: {
    width: '85%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  activityModal_title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2D2A6E',
  },
  activityModal_description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  activityModal_imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  activityModal_noImageText: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 15,
  },
  activityModal_infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  activityModal_infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  activityModal_buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  activityModal_joinButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  activityModal_closeButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center',
  },
  activityModal_buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  profileButton: {
    backgroundColor: '#007bff',
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: 'bold',
  },
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
  }
});


