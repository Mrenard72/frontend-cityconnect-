// SortiesScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-city-connect.vercel.app';

const SortiesScreen = () => {
  const [sorties, setSorties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  // Récupérer le token stocké
  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error("Erreur lors de la récupération du token", error);
      return null;
    }
  };

  // Récupérer le profil de l'utilisateur pour obtenir son _id
  const fetchUserProfile = async () => {
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserId(data._id);
      } else {
        Alert.alert("Erreur", data.message || "Impossible de récupérer le profil.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      Alert.alert("Erreur", "Impossible de récupérer le profil.");
    }
  };

  // Récupérer tous les événements, puis filtrer ceux auxquels l'utilisateur est inscrit
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        // Filtrer les événements où l'utilisateur est inscrit en convertissant chaque participant en string
        const reservedEvents = data.filter(event =>
            (event.participants || []).some(participant => participant.toString() === userId)
          );
          
        setSorties(reservedEvents);
      } else {
        Alert.alert("Erreur", data.message || "Impossible de récupérer les événements.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      Alert.alert("Erreur", "Impossible de récupérer les événements.");
    }
    setLoading(false);
  };
  

  // Charger le profil utilisateur
  useEffect(() => {
    const init = async () => {
      await fetchUserProfile();
    };
    init();
  }, []);

  // Une fois l'ID utilisateur récupéré, charger et filtrer les événements
  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color="#2D2A6E"
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mes Sorties</Text>
      <FlatList
        data={sorties}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={<Text>Aucune sortie réservée.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontFamily: 'FredokaOne', marginBottom: 20, color: '#2D2A6E' },
  itemContainer: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DDD'
  },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2D2A6E' },
  description: { fontSize: 14, color: '#555' }
});

export default SortiesScreen;
