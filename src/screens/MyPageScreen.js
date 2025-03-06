import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome } from '@expo/vector-icons';
import Header from '../components/Header'; // ✅ Ajout du composant Header



const BASE_URL = 'https://backend-city-connect.vercel.app';

const MyPageScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [activities, setActivities] = useState([]);
console.log(userId);
  useEffect(() => {
    fetchUserProfile();
    fetchUserActivities();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        Alert.alert('Erreur', data.message || "Impossible de charger le profil.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
    }
  };

  const fetchUserActivities = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId}/activities`);
      const data = await response.json();
      if (response.ok) {
        setActivities(data);
      } else {
        Alert.alert('Erreur', "Impossible de charger les activités.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des activités :", error);
    }
  };

  const handleRateUser = async (newRating) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté pour noter cet utilisateur.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/auth/${userId}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });
  
      if (response.ok) {
        setRating(newRating);
        Alert.alert("Merci !", "Votre note a été enregistrée.");
        
        // 🚀 Forcer l'actualisation du profil
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors de la notation :", error);
    }
  };

  const updateBio = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté pour modifier votre bio.");
      return;
    }
  
    try {
      const response = await fetch(`${BASE_URL}/users/update-bio`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio: user.bio }),
      });
  
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Succès", "Bio mise à jour !");
      } else {
        Alert.alert("Erreur", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la bio :", error);
    }
  };
  
  

  if (!user) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      {/* 🔹 Header global */}
      <Header title="Profil Utilisateur" navigation={navigation} />

      {/* 🔹 Profil */}
      <View style={styles.profileContainer}>
        <Image source={{ uri: user.photo }} style={styles.profileImage} />
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.rating}>Note moyenne: ⭐ {user.averageRating || "Pas encore noté"}</Text>
        <TextInput
              style={styles.bioInput}
              value={user.bio}
              onChangeText={(text) => setUser({ ...user, bio: text })}
              />
        <TouchableOpacity style={styles.updateButton} onPress={updateBio}>
        <Text style={styles.updateButtonText}>Mettre à jour</Text>
        </TouchableOpacity>


      </View>

      {/* 🔹 Activités */}
      <Text style={styles.sectionTitle}>Activités créées</Text>
      {activities.length === 0 ? (
        <Text style={styles.noActivities}>Aucune activité créée.</Text>
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.activityItem}>
                <Image source={{ uri: item.image }} style={styles.activityImage} />
              <View style={styles.activityTextContainer}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
              </View>
            </View>
          )}
        />
      )}
      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', paddingTop: 60, alignItems: 'center' },
  profileContainer: { alignItems: 'center', padding: 20 },
  profileImage: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, marginTop: 20, borderWidth: 4, borderColor: '#20135B',},
  userName: { fontSize: 22, fontFamily: 'FredokaOne', color: '#2D2A6E', textAlign: 'center' },
  rating: { fontSize: 18, color: '#555', textAlign: 'center', fontFamily: 'FredokaOne' },
  bio: { fontSize: 16, fontStyle: 'italic', color: '#777', textAlign: 'center', marginVertical: 10 },
  sectionTitle: { fontSize: 20, fontFamily: 'FredokaOne', marginTop: 15, textAlign: 'center' },
  noActivities: { fontSize: 16, color: '#777', textAlign: 'center', marginVertical: 10 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 10, borderWidth: 1, borderColor: '#DDD', marginVertical: 5, borderRadius: 8, width: '90%', alignSelf: 'center' },
  activityImage: { width: 120, height: 120, borderRadius: 20, marginRight: 20 },
  activityTextContainer: { flex: 1 },
  activityTitle: { fontSize: 18, fontFamily: 'FredokaOne' },
  activityDescription: { fontSize: 14, color: '#555',fontFamily: 'FredokaOne' },
  ratingContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  bioInput: { width: '90%', height: 50, borderColor: '#DDD', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 10, textAlign: 'center',},
  updateButton: { backgroundColor: '#2D2A6E', padding: 10, borderRadius: 8, marginTop: 10, },
  updateButtonText: {color: 'white', textAlign: 'center', fontFamily: 'FredokaOne', fontSize: 16, },
  
});

export default MyPageScreen;
