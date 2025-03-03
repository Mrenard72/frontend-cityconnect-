import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import Header from '../components/Header';

const BACKEND_URL = "https://backend-city-connect.vercel.app/api"; // ✅ URL du backend

const RestaurantsScreen = () => {
    const [restaurants, setRestaurants] = useState([]);
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
            fetchRestaurants(userCoords);
        };

        getLocationAndRestaurants();
    }, []);

    const fetchRestaurants = async (coords) => {
        const url = `${BACKEND_URL}/restaurants?lat=${coords.latitude}&lon=${coords.longitude}`;

        try {
            console.log(`🔍 Requête vers : ${url}`);
            const response = await axios.get(url);
            console.log("✅ Réponse API Backend:", response.data);

            if (response.data.message) {
                Alert.alert("Info", response.data.message);
            }

            setRestaurants(response.data);
        } catch (error) {
            console.error("❌ Erreur API Backend:", error.response ? error.response.data : error);
            Alert.alert("Erreur", "Impossible de récupérer les restaurants.");
        }
        setLoading(false);
    };

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
                            description={`${restaurant.address}, ${restaurant.city}`}
                        />
                    ))}
                </MapView>
            ) : (
                <ActivityIndicator size="large" color="#0000ff" />
            )}

            <View style={styles.listContainer}>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                {restaurants.length === 0 && !loading && <Text style={styles.noData}>Aucun restaurant disponible</Text>}
                <FlatList
                    data={restaurants}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.restaurant}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text>{item.address}, {item.city}</Text>
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
        marginVertical: 5,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    noData: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 10,
        color: 'gray',
    }
});

export default RestaurantsScreen;
