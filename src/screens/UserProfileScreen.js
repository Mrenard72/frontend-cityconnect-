// Importation des modules React et React Native nécessaires
import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, ImageBackground, TouchableOpacity, StyleSheet, FlatList, Alert,
  ActivityIndicator
} from 'react-native';
// AsyncStorage pour stocker et récupérer des données localement
import AsyncStorage from '@react-native-async-storage/async-storage';
// Icônes pour l'interface utilisateur
import { Ionicons, FontAwesome } from '@expo/vector-icons';
// Composant Header personnalisé de l'application
import Header from '../components/Header';

// URL de base de l'API backend
const BASE_URL = 'https://backend-city-connect.vercel.app';

// Composant principal pour afficher le profil d'un utilisateur
const UserProfileScreen = ({ route, navigation }) => {
  // Récupération du userId depuis les paramètres de navigation
  const { userId } = route.params;
  
  // États pour gérer les données et l'état de l'interface
  const [user, setUser] = useState(null);          // Données de l'utilisateur
  const [rating, setRating] = useState(0);         // Note donnée par l'utilisateur courant
  const [activities, setActivities] = useState([]); // Liste des activités de l'utilisateur
  const [loading, setLoading] = useState(true);    // État de chargement
  const [error, setError] = useState(null);        // État d'erreur

  // Effet qui s'exécute au chargement du composant
  useEffect(() => {
    fetchUserProfile();    // Récupère les informations du profil
    fetchUserActivities(); // Récupère les activités de l'utilisateur
  }, []);

  // Fonction pour récupérer les données du profil de l'utilisateur depuis l'API
  const fetchUserProfile = async () => {
    try {
      // Appel API pour récupérer les données du profil
      const response = await fetch(`${BASE_URL}/users/${userId._id}`);
      const data = await response.json();
      
      if (response.ok) {
        // Mise à jour de l'état avec les données récupérées
        setUser(data);
      } else {
        // Gestion des erreurs de l'API
        setError(data.message || "Impossible de charger le profil.");
        Alert.alert('Erreur', data.message || "Impossible de charger le profil.");
      }
    } catch (error) {
      // Gestion des erreurs réseau ou autres exceptions
      console.error("Erreur lors de la récupération du profil :", error);
      setError("Erreur de connexion au serveur");
    }
  };

  // Fonction pour récupérer les activités de l'utilisateur depuis l'API
  const fetchUserActivities = async () => {
    setLoading(true); // Indique que le chargement est en cours
    try {
      // Appel API pour récupérer les activités
      const response = await fetch(`${BASE_URL}/users/${userId._id}/activities`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("Activités récupérées:", data);
        
        // Traitement des images d'activités pour s'assurer qu'elles sont correctement formatées
        const activitiesWithImages = data.map(activity => {
          // Vérification si l'activité a des photos dans le format du backend
          if (activity.photos && activity.photos.length > 0) {
            return {
              ...activity,
              image: activity.photos[0] // Utilise la première photo comme image principale
            };
          }
          
          // Si pas de photos mais une image existe déjà, on la conserve
          if (activity.image) {
            return activity;
          }
          
          // Si aucune image n'est disponible, on définit image à null
          return {
            ...activity,
            image: null
          };
        });
        
        // Mise à jour de l'état avec les activités formatées
        setActivities(activitiesWithImages);
      } else {
        // Gestion des erreurs de l'API
        setError("Impossible de charger les activités.");
        Alert.alert('Erreur', "Impossible de charger les activités.");
      }
    } catch (error) {
      // Gestion des erreurs réseau ou autres exceptions
      console.error("Erreur lors de la récupération des activités :", error);
      setError("Erreur de connexion au serveur");
    } finally {
      // Dans tous les cas, on arrête l'indicateur de chargement
      setLoading(false);
    }
  };

  // Fonction pour noter un utilisateur
  const handleRateUser = async (newRating) => {
    // Récupération du token d'authentification
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      // Vérification si l'utilisateur est connecté
      Alert.alert("Erreur", "Vous devez être connecté pour noter cet utilisateur.");
      return;
    }
    try {
      // Envoi de la note au serveur
      const response = await fetch(`${BASE_URL}/auth/${userId._id}/rate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: newRating }),
      });
  
      if (response.ok) {
        // Mise à jour de l'interface utilisateur
        setRating(newRating);
        Alert.alert("Merci !", "Votre note a été enregistrée.");
        
        // Rafraîchissement du profil après un court délai pour voir la nouvelle note moyenne
        setTimeout(() => {
          fetchUserProfile();
        }, 500);
      }
    } catch (error) {
      console.error("Erreur lors de la notation :", error);
    }
  };
  
  // Fonction pour naviguer vers les détails d'une activité
  const navigateToActivityDetails = (activity) => {
    navigation.navigate('ActivityDetails', { activity });
  };

  // Affichage d'un indicateur de chargement si les données de l'utilisateur ne sont pas encore disponibles
  if (!user) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2D2A6E" />
      <Text>Chargement du profil...</Text>
    </View>
  );

  // Fonction pour retourner à l'écran précédent
  const handleGoBack = () => navigation.goBack();

  // Rendu du composant
  return (
     
    <View style={styles.container}>
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      {/* En-tête de l'application */}
      <Header/>
      
      {/* Bouton de retour et conteneur d'en-tête */}
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

      {/* Section d'affichage du profil de l'utilisateur */}
      <View style={styles.profileContainer}>
        {/* Photo de profil */}
        <Image 
          source={{ uri: user.photo }} 
          style={styles.profileImage}
          //defaultSource={require('../assets/default-avatar.png')} // Image par défaut si l'URI est indisponible
        />
        {/* Informations du profil */}
        <Text style={styles.userName}>{user.username}</Text>
        <Text style={styles.rating}>Note moyenne: ⭐ {user.averageRating || "Pas encore noté"}</Text>
        <Text style={styles.bio}>{user.bio || "Pas de bio disponible."}</Text>
      </View>

      {/* Section d'affichage des activités créées par l'utilisateur */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>Activités créées</Text>
        
        {/* Affichage conditionnel selon l'état du chargement et des données */}
        {loading ? (
          // Indicateur de chargement
          <ActivityIndicator size="small" color="#2D2A6E" style={styles.loader} />
        ) : error ? (
          // Message d'erreur
          <Text style={styles.errorText}>{error}</Text>
        ) : activities.length === 0 ? (
          // Message si aucune activité n'est disponible
          <Text style={styles.noActivities}>Aucune activité créée.</Text>
        ) : (
          // Liste des activités
          <FlatList
            data={activities}
            keyExtractor={(item) => item._id}
            style={styles.activityList}
            contentContainerStyle={styles.activityListContent}
            renderItem={({ item }) => (
              // Élément d'activité cliquable
              <TouchableOpacity 
                style={styles.activityItem}
                //onPress={() => navigateToActivityDetails(item)}
              >
                {/* Gestion conditionnelle de l'affichage des images d'activités */}
                {item.image ? (
                  // Si l'activité a une image définie
                  <Image 
                    source={{ uri: item.image }} 
                    style={styles.activityImage}
                  />
                ) : item.photos && item.photos.length > 0 ? (
                  // Si l'activité a des photos au format backend
                  <Image 
                    source={{ uri: item.photos[0] }} 
                    style={styles.activityImage}
                  />
                ) : (
                  // Affichage d'un placeholder si aucune image n'est disponible
                  <View style={[styles.activityImage, styles.noImagePlaceholder]}>
                    <FontAwesome name="image" size={24} color="#DDD" />
                  </View>
                )}
                
                {/* Conteneur des informations textuelles de l'activité */}
                <View style={styles.activityTextContainer}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                  {/* Métadonnées de l'activité (catégorie et date) */}
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
      
      {/* Section de notation de l'utilisateur */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>Noter cet utilisateur</Text>
        {/* Système d'étoiles pour la notation */}
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

// Styles pour le composant
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%', resizeMode: 'cover' }, // Style pour l'image de fond
  container: { 
    flex: 1, 
    backgroundColor: 'white', // Couleur de fond principale
  },
  backButton: {
    padding: 8 // Espacement interne du bouton de retour
  },
  placeholder: {
    width: 40,
    fontFamily: 'FredokaOne', // Police personnalisée pour l'application
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white' // Conteneur pour l'indicateur de chargement
  },
  profileContainer: { 
    alignItems: 'center', 
    padding: 20,
    marginTop: 150, // Marge supérieure pour positionner sous le header
    fontFamily: 'FredokaOne',
  },
  profileImage: { 
    width: 120, height: 120, borderRadius: 80, backgroundColor: 'white',
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    marginBottom: 20, borderWidth: 4, borderColor: '#20135B', // Style pour l'image de profil circulaire
  },
  userName: { 
    fontSize: 22, 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E', // Couleur principale du texte dans l'application
    textAlign: 'center' 
  },
  rating: { 
    fontSize: 18, 
    color: '#2D2A6E', 
    textAlign: 'center',
    fontFamily: 'FredokaOne',
  },
  bio: { 
    fontSize: 16, 
    fontStyle: 'italic', 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E', 
    textAlign: 'center', 
    marginVertical: 10,
    paddingHorizontal: 20 // Espacement horizontal pour le texte de bio
  },
  activitiesSection: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 15 // Section contenant la liste des activités
  },
  sectionTitle: { 
    fontSize: 20, 
    fontFamily: 'FredokaOne',
    marginTop: 15, 
    marginBottom: 10,
    textAlign: 'center' // Titre de section
  },
  noActivities: { 
    fontSize: 16, 
    color: '#2D2A6E', 
    textAlign: 'center', 
    marginVertical: 10 // Message affiché quand il n'y a pas d'activités
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10 // Style pour les messages d'erreur
  },
  loader: {
    marginVertical: 20 // Espacement pour l'indicateur de chargement
  },
  activityList: {
    width: '100%',
    flex: 1 // Liste des activités prend tout l'espace disponible
  },
  activityListContent: {
    paddingBottom: 20 // Espacement en bas de la liste pour le scroll
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
    shadowColor: '#000', // Ombre pour effet d'élévation
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Élévation pour Android
    fontFamily: 'FredokaOne',
  },
  activityImage: { 
    width: 80, 
    height: 80, 
    borderRadius: 10, 
    marginRight: 10,
    backgroundColor: '#f0f0f0' // Image d'activité avec coins arrondis
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
    backgroundColor: '#FAFAFA' // Placeholder quand il n'y a pas d'image
  },
  activityTextContainer: { 
    flex: 1 // Conteneur de texte qui prend l'espace restant
  },
  activityTitle: { 
    fontSize: 16, 
    fontFamily: 'FredokaOne',
    color: '#2D2A6E' // Titre de l'activité
  },
  activityDescription: { 
    fontSize: 14, 
    color: '#2D2A6E',
    marginTop: 5,
    fontFamily: 'FredokaOne', // Description de l'activité
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    fontFamily: 'FredokaOne', // Métadonnées d'activité en ligne
  },
  activityCategory: {
    fontSize: 12,
    color: '#2D2A6E',
    fontFamily: 'FredokaOne',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10 // Badge de catégorie avec fond gris clair
  },
  activityDate: {
    fontSize: 12,
    color: '#2D2A6E',
    fontFamily: 'FredokaOne', // Date de l'activité
  },
  ratingSection: {
    padding: 15,
    width: '100%',
    fontFamily: 'FredokaOne', // Section de notation en bas
  },
  ratingContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 10, 
    marginBottom: 20,
    fontFamily: 'FredokaOne' // Conteneur des étoiles de notation
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 21, // Pour s'assurer que le bouton est au-dessus des autres éléments
    padding: 5, // Style pour le bouton de retour en position absolue
  },
});

// Exportation du composant pour l'utiliser dans l'application
export default UserProfileScreen;