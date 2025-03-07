import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, FlatList, Alert, TextInput
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Header from '../components/Header';

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
        // Traitement pour gérer les images selon la présence de photos ou d'une image
        const activitiesWithImages = data.map(activity => {
          if (activity.photos && activity.photos.length > 0) {
            return { ...activity, image: activity.photos[0] };
          }
          if (activity.image) {
            return activity;
          }
          return { ...activity, image: null };
        });
        setActivities(activitiesWithImages);
      } else {
        console.error('Erreur lors du chargement des activités:', data);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des activités :", error);
    }
  };
  
  const navigateToActivityDetails = (activity) => {
    navigation.navigate('ActivityDetails', { activity });
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

  // Bouton de retour
  const handleGoBack = () => navigation.goBack();

  return (
    <View style={styles.container}>
       <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      {/* 🔹 Header global */}
      <Header title="Profil Utilisateur" navigation={navigation} />
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#20135B" />
        </TouchableOpacity>
      </View>

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
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Activités créées</Text>
        {activities.length === 0 ? (
          <Text style={styles.noActivities}>Aucune activité créée.</Text>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item, index) => item._id ? item._id : index.toString()}
            style={styles.activityList}
            contentContainerStyle={styles.activityListContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.activityItem}
                onPress={() => navigateToActivityDetails(item)}
              >
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.activityImage} />
                ) : (
                  <View style={[styles.activityImage, styles.noImagePlaceholder]}>
                    <FontAwesome name="image" size={24} color="#DDD" />
                  </View>
                )}
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={styles.activityCategory}>
                      {item.category}
                    </Text>
                    <Text style={styles.activityDate}>
                      {item.date ? new Date(item.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : "Date non définie"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
   background: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  container: { 
    flex: 1, 
    backgroundColor: 'white', 
    
  },
  profileContainer: { 
    alignItems: 'center', 
    padding: 20,
    marginTop: 110, 
  },
  profileImage: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 10, 
    marginTop: 20, 
    borderWidth: 4, 
    borderColor: '#20135B'
  },
  userName: { 
    fontSize: 22, 
    fontFamily: 'FredokaOne', 
    color: '#2D2A6E', 
    textAlign: 'center' 
  },
  rating: { 
    fontSize: 18, 
    color: '#555', 
    textAlign: 'center', 
    fontFamily: 'FredokaOne' 
  },
  bio: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    color: '#777', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  bioInput: { 
    width: '90%', 
    height: 50, 
    borderColor: '#DDD', 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 10, 
    marginTop: 10, 
    textAlign: 'center'
  },
  updateButton: { 
    backgroundColor: '#2D2A6E', 
    padding: 10, 
    borderRadius: 8, 
    marginTop: 10 
  },
  updateButtonText: {
    color: 'white', 
    textAlign: 'center', 
    fontFamily: 'FredokaOne', 
    fontSize: 16
  },
  activitiesSection: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 15
  },
  sectionTitle: { 
    fontSize: 20, 
    fontFamily: 'FredokaOne', 
    marginTop: 15, 
    marginBottom: 10,
    textAlign: 'center' 
  },
  noActivities: { 
    fontSize: 16, 
    color: '#777', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  activityList: {
    width: '100%',
    flex: 1
  },
  activityListContent: {
    paddingBottom: 20
  },
  activityItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10, 
    borderWidth: 1, 
    borderColor: '#DDD', 
    marginVertical: 5, 
    borderRadius: 8, 
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2
  },
  activityImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 10
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA'
  },
  activityTextContainer: { 
    flex: 1 
  },
  activityTitle: { 
    fontSize: 16, 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E'
  },
  activityDescription: { 
    fontSize: 14, 
    color: '#555',
    fontFamily: 'FredokaOne',
    marginTop: 5
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  activityCategory: {
    fontSize: 12,
    color: '#2D2A6E',
    fontFamily: 'FredokaOne',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10
  },
  activityDate: {
    fontSize: 12,
    color: '#777',
    fontFamily: 'FredokaOne'
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 21,
    padding: 5,
  },
});

export default MyPageScreen;