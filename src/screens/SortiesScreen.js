import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-city-connect.vercel.app';
const BACKGROUND_IMAGE = require('../../assets/background.png');
const ITEM_BACKGROUND_IMAGE = require('../../assets/item-background.jpg');

const SortiesScreen = () => {
  const [sorties, setSorties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté.");
        return;
      }
      try {
        const response = await fetch(`${BASE_URL}/auth/profile`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) setUserId(data._id);
        else Alert.alert("Erreur", data.message || "Impossible de récupérer le profil.");
      } catch (error) {
        console.error("Erreur profil:", error);
        Alert.alert("Erreur", "Impossible de récupérer le profil.");
      }
    };
    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/events`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (response.ok) {
          const reservedEvents = data.filter(event =>
            event.participants.includes(userId)
          );
          setSorties(reservedEvents);
        } else {
          Alert.alert("Erreur", "Impossible de récupérer les événements.");
        }
      } catch (error) {
        console.error("Erreur récupération événements:", error);
      }
      setLoading(false);
    };
    fetchEvents();
  }, [userId]);

  const handleLeave = async (eventId) => {
    try {
      const response = await fetch(`${BASE_URL}/events/${eventId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`, 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (response.ok) {
        setSorties(sorties.filter(event => event._id !== eventId));
      } else {
        Alert.alert("Erreur", data.message || "Impossible de quitter l'événement.");
      }
    } catch (error) {
      console.error("Erreur lors du départ de l'événement:", error);
      Alert.alert("Erreur", "Impossible de quitter l'événement.");
    }
  };

  const handleContact = async (recipientId, eventId) => {
    try {
      const response = await fetch(`${BASE_URL}/conversations/create`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId, eventId })
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Succès", "Conversation créée avec succès.");
      } else {
        Alert.alert("Erreur", data.message || "Impossible de contacter ce guide.");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      Alert.alert("Erreur", "Impossible de contacter ce guide.");
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <ImageBackground source={ITEM_BACKGROUND_IMAGE} style={styles.imageBackground} imageStyle={styles.imageBorder}>
          <View style={styles.overlay}>
            <Text style={styles.guide}>Guide: {item.createdBy.username}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleContact(item.createdBy._id, item._id)}>
              <Text style={styles.buttonText}>Contacter</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.leaveButton} onPress={() => handleLeave(item._id)}>
              <Text style={styles.leaveButtonText}>Quitter</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  };

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Mes Sorties</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2D2A6E" />
        ) : (
          <FlatList
            data={sorties}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucune sortie réservée.</Text>}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontFamily: 'FredokaOne',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2D2A6E'
  },
  itemContainer: {
    width: '100%',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
  },
  imageBackground: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBorder: {
    borderRadius: 12,
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#2D2A6E',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'FredokaOne'
  },
  leaveButton: {
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 10,
  },
  leaveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'FredokaOne'
  },
  guide: {
    fontSize: 16,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
  },
  title: {
    fontSize: 20,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginTop: 10,
  },
  description: {
    fontSize: 16,
    color: '#2D2A6E',
    marginTop: 10,
    fontFamily: 'FredokaOne',
  },

  emptyText: {
    fontSize: 16,
    color: '#2D2A6E',
    textAlign: 'center',
  },

  
});

export default SortiesScreen;
