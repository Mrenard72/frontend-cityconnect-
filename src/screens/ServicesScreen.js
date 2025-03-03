import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://backend-city-connect.vercel.app';
const BACKGROUND_IMAGE = require('../../assets/background.png');
const ITEM_BACKGROUND_IMAGE = require('../../assets/item-background.jpg');

const ServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error("Erreur lors de la récupération du token", error);
      return null;
    }
  };

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
        const createdEvents = data.filter(event => event.createdBy && event.createdBy._id === userId);
        setServices(createdEvents);
      } else {
        Alert.alert("Erreur", data.message || "Impossible de récupérer les événements.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des événements:", error);
      Alert.alert("Erreur", "Impossible de récupérer les événements.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserProfile();
    };
    init();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchEvents();
    }
  }, [userId]);

  const cancelService = async (eventId) => {
    const token = await getToken();
    if (!token) {
      Alert.alert("Erreur", "Vous devez être connecté.");
      return;
    }
    try {
      const response = await fetch(`${BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (response.ok) {
        setServices(prevServices => prevServices.filter(service => service._id !== eventId));
        Alert.alert("Succès", "L'activité a été annulée.");
      } else {
        Alert.alert("Erreur", data.message || "Impossible d'annuler l'activité.");
      }
    } catch (error) {
      console.error("Erreur lors de l'annulation de l'activité:", error);
      Alert.alert("Erreur", "Impossible d'annuler l'activité.");
    }
  };

  const showParticipants = async (participantIds) => {
    if (!participantIds || participantIds.length === 0) {
      setSelectedParticipants([]);
      setModalVisible(true);
      return;
    }
    try {
      const token = await getToken();
      const response = await fetch(`${BASE_URL}/users/participants`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ participantIds })
      });
      const data = await response.json();
      if (response.ok) {
        setSelectedParticipants(data);
      } else {
        setSelectedParticipants([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des participants:", error);
      setSelectedParticipants([]);
    }
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <ImageBackground source={ITEM_BACKGROUND_IMAGE} style={styles.imageBackground} imageStyle={styles.imageBorder}>
        <View style={styles.overlay}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
          <Text style={styles.participants}>Participants : {item.participants?.length || 0}</Text>
          <TouchableOpacity style={styles.participantButton} onPress={() => showParticipants(item.participants)}>
            <Text style={styles.participantButtonText}>Voir Participants</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => cancelService(item._id)}>
            <Text style={styles.cancelButtonText}>Annuler l'activité</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.header}>Mes Services</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#2D2A6E" />
        ) : (
          <FlatList
            data={services}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>Aucun service créé.</Text>}
          />
        )}
      </View>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Participants</Text>
            {selectedParticipants.length > 0 ? selectedParticipants.map((p, index) => (
              <Text key={index} style={styles.participantText}>{p.username}</Text>
            )) : <Text style={styles.participantText}>Aucun participant</Text>}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};


const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontFamily: 'FredokaOne', textAlign: 'center', marginBottom: 20, color: '#2D2A6E' },
  itemContainer: { width: '100%', borderRadius: 12, marginBottom: 15, overflow: 'hidden' },
  imageBackground: { width: '100%', justifyContent: 'center', alignItems: 'center' },
  imageBorder: { borderRadius: 12 },
  overlay: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 20, borderRadius: 12, width: '100%', alignItems: 'center' },
  cancelButton: { backgroundColor: 'red', padding: 10, borderRadius: 8, marginTop: 10 },
  cancelButtonText: { color: '#fff', fontSize: 14, fontFamily: 'FredokaOne' },
  title: { fontSize: 20, fontFamily: 'FredokaOne', color: '#2D2A6E', marginTop: 10 },
  description: { fontSize: 16, color: '#2D2A6E', marginTop: 10, fontFamily: 'FredokaOne' },
  participants: { fontSize: 14, fontStyle: 'italic', color: '#777', marginVertical: 5 },
  emptyText: { fontSize: 16, color: '#2D2A6E', textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 10,
  },
  participantText: {
    fontSize: 16,
    color: '#2D2A6E',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#2D2A6E',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'FredokaOne',
  },
  participantButton: {
    backgroundColor: '#2D2A6E',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  participantButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'FredokaOne',
  },

});

export default ServicesScreen;