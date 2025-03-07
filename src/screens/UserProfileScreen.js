import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, FlatList, Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import Header from '../components/Header';

const BASE_URL = 'https://backend-city-connect.vercel.app';

const UserProfileScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchUserActivities();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/${userId._id}`);
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        setError(data.message || "Impossible de charger le profil.");
        Alert.alert('Erreur', data.message || "Impossible de charger le profil.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil :", error);
      setError("Erreur de connexion au serveur");
    }
  };

  const fetchUserActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/users/${userId._id}/activities`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("Activités récupérées:", data);
        
        // Traitement des images d'activités en utilisant la même logique que MapScreen
        const activitiesWithImages = data.map(activity => {
          // Vérifier si l'activité a des photos dans le format du backend
          if (activity.photos && activity.photos.length > 0) {
            return {
              ...activity,
              image: activity.photos[0] // Utiliser la première photo comme image principale
            };
          }
          
          // Si pas de photos mais une image, garder l'image
          if (activity.image) {
            return activity;
          }
          
          // Si aucune image n'est disponible
          return {
            ...activity,
            image: null
          };
        });
        
        setActivities(activitiesWithImages);
      } else {
        setError("Impossible de charger les activités.");
        Alert.alert('Erreur', "Impossible de charger les activités.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des activités :", error);
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const handleRateUser = async (newRating) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté pour noter cet utilisateur.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/auth/${userId._id}/rate`, {
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
        
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors de la notation :", error);
    }
  };
  
  const navigateToActivityDetails = (activity) => {
    // Navigation vers les détails de l'activité, comme dans MapScreen
    navigation.navigate('ActivityDetails', { activity });
  };

  if (!user) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2D2A6E" />
      <Text>Chargement du profil...</Text>
    </View>
  );

  // Bouton de retour
  const handleGoBack = () => navigation.goBack();

  return (
     
    <View style={styles.container}>
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header/>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#20135B" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2D2A6E" />
        </TouchableOpacity>
       
        <View style={styles.placeholder} />
      </View>

      {/* Profil */}
      <View style={styles.profileContainer}>
        <Image 
          source={{ uri: user.photo }} 
          style={styles.profileImage}
          //defaultSource={require('../assets/default-avatar.png')}
        />
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.rating}>Note moyenne: ⭐ {user.averageRating || "Pas encore noté"}</Text>
        <Text style={styles.bio}>{user.bio || "Pas de bio disponible."}</Text>
      </View>

      {/* Activités */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Activités créées</Text>
        
        {loading ? (
          <ActivityIndicator size="small" color="#2D2A6E" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : activities.length === 0 ? (
          <Text style={styles.noActivities}>Aucune activité créée.</Text>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item._id}
            style={styles.activityList}
            contentContainerStyle={styles.activityListContent}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.activityItem}
                onPress={() => navigateToActivityDetails(item)}
              >
                {/* Gestion de l'image similaire à MapScreen */}
                {item.image ? (
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.activityImage}
                  />
                ) : item.photos && item.photos.length > 0 ? (
                  <Image 
                    source={{ uri: item.photos[0] }} 
                    style={styles.activityImage}
                  />
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
      
      {/* Notation */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Noter cet utilisateur</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => handleRateUser(star)}>
              <FontAwesome name={star <= rating ? "star" : "star-o"} size={30} color="gold" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' },
  container: { 
    flex: 1, 
    backgroundColor: 'white',
    
  },
  backButton: {
    padding: 8
  },
  placeholder: {
    width: 40,
    fontFamily: 'FredokaOne',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
  profileContainer: { 
    alignItems: 'center', 
    padding: 20,
    marginTop: 150,
    fontFamily: 'FredokaOne',
  },
  profileImage: { 
      width: 120, height: 120, borderRadius: 80, backgroundColor: 'white',
      justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
      marginBottom: 20, borderWidth: 4, borderColor: '#20135B',
  
  },
  userName: { 
    fontSize: 22, 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E', 
    textAlign: 'center' 
  },
  rating: { 
    fontSize: 18, 
    color: '#2D2A6E', 
    textAlign: 'center' ,
    fontFamily: 'FredokaOne',
  },
  bio: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E', 
    textAlign: 'center', 
    marginVertical: 10,
    paddingHorizontal: 20
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
    color: '#2D2A6E', 
    textAlign: 'center', 
    marginVertical: 10 
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10
  },
  loader: {
    marginVertical: 20
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
    elevation: 2,
    fontFamily: 'FredokaOne',
  },
  activityImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 10,
    backgroundColor: '#f0f0f0'
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
    color: '#2D2A6E',
    marginTop: 5,
    fontFamily: 'FredokaOne',
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontFamily: 'FredokaOne',
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
    color: '#2D2A6E',
    fontFamily: 'FredokaOne',
  },
  ratingSection: {
    padding: 15,
    width: '100%',
    fontFamily: 'FredokaOne',
  },
  ratingContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10, 
    marginBottom: 20 ,
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

export default UserProfileScreen;