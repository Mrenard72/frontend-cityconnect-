import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import Header from '../components/Header';


// ✅ Fonction pour calculer la distance entre 2 points GPS
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1); // ✅ Distance en km arrondie à 1 décimale
};

const fetchRestaurants = async (coords, setRestaurants, setSortedRestaurants, setLoading) => {
    const overpassQuery = `
        [out:json];
        node[amenity=restaurant](around:5000, ${coords.latitude}, ${coords.longitude});
        out;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;

    try {
        console.log(`🔍 Requête vers Overpass API: ${url}`);
        const response = await fetch(url);
        const data = await response.json();
// verifie si element disponible
        if (data.elements && data.elements.length > 0) {
            // transformation des données brutes en format utilisable pour l'app
            const restaurants = data.elements.map((place) => ({
                id: place.id.toString(),
                name: place.tags.name || "Nom inconnu", // valeur par defaut si pas trouvé
                address: place.tags["addr:street"] || "Adresse non disponible", // same
                latitude: place.lat,
                longitude: place.lon,
                distance: calculateDistance(coords.latitude, coords.longitude, place.lat, place.lon), // calcul de la distance 
            }));

            setRestaurants(restaurants); // ✅ Stocke la liste des restaurants pour la carte

           // Création d'une copie triée par distance pour l'affichage en liste
            const sortedRestaurants = [...restaurants].sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            setSortedRestaurants(sortedRestaurants);
        } else {
            Alert.alert("Info", "Aucun restaurant trouvé dans cette zone.");
            setRestaurants([]);
            setSortedRestaurants([]);
        }
    } catch (error) {
        console.error("❌ Erreur Overpass API:", error);
        Alert.alert("Erreur", "Impossible de récupérer les restaurants.");
    }
    setLoading(false);
};

const RestaurantsScreen = () => {
    const [restaurants, setRestaurants] = useState([]); //  Pour les marqueurs
    const [sortedRestaurants, setSortedRestaurants] = useState([]); //  Liste triée pour l'affichage
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState(null);

    useEffect(() => {
        const getLocationAndRestaurants = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission refusée', 'Activez la localisation pour voir les restaurants.');
                setLoading(false);
                return;
            }

            let userLocation = await Location.getCurrentPositionAsync({});
            const userCoords = {
                latitude: userLocation.coords.latitude,
                longitude: userLocation.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };

            setLocation(userCoords);
            fetchRestaurants(userCoords, setRestaurants, setSortedRestaurants, setLoading);
        };

        getLocationAndRestaurants();
    }, []);

    return (
        <View style={styles.container}>
            <Header />
            
            {location ? (
                <MapView 
                    style={styles.map}
                    initialRegion={location}
                    showsUserLocation={true}
                >
                    {restaurants.map((restaurant) => (
                        <Marker
                            key={restaurant.id}
                            coordinate={{ latitude: restaurant.latitude, longitude: restaurant.longitude }}
                            title={restaurant.name}
                            description={`${restaurant.address} - ${restaurant.distance} km`}
                        />
                    ))}
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" />
            )}

            <View style={styles.listContainer}>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                {sortedRestaurants.length === 0 && !loading && <Text style={styles.noData}>Aucun restaurant disponible</Text>}
                <FlatList
  data={sortedRestaurants}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.restaurant}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name} - {item.distance} km</Text>
        <View style={styles.addressContainer}>
          <Text style={styles.addressText}>{item.address}</Text>
        </View>
      </View>
    </View>
  )}
/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    map: {
        flex: 1,
        height: '50%',
    },
    listContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ffffff',
    },
    restaurant: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 8,
        borderRadius: 12, // ✅ Arrondir les coins
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15, // ✅ Ombre plus douce
        shadowRadius: 5,
        elevation: 4, // ✅ Ombre pour Android
        flexDirection: 'row', // 
        alignItems: 'center',
        fontFamily: 'FredokaOne',
      },
    
      name: {
        fontSize: 18,
        fontFamily: 'FredokaOne',
        color: '#2D2A6E', 
        marginBottom: 5,

      },
    
      addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
      },
    
      addressText: {
        fontSize: 14,
        color: '#555', // ✅ Gris doux
        marginLeft: 5,
        fontFamily: 'FredokaOne',
      },
    
      locationIcon: {
        width: 16,
        height: 16,
        tintColor: '#FF5733', // ✅ Couleur vive pour contraste
      },
    
});

export default RestaurantsScreen;
