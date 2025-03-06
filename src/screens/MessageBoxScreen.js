import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, ImageBackground, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Header from '../components/Header';

const BACKEND_URL = 'https://backend-city-connect.vercel.app';

export default function MessageBoxScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchUserId = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok && data._id) {
        setUserId(data._id);
      }
    } catch (error) {
      console.error('Erreur fetchUserId:', error);
    }
  };

  const fetchConversations = async () => {
    

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/conversations/my-conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (response.ok) {
        setConversations(data);
      } else {
        console.error('Erreur API :', data.message);
      }
    } catch (error) {
      console.error('Erreur récupération conversations :', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserId().then(() => fetchConversations());
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#20135B" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header/>
      <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
        <Text style={styles.headerTitle}>Mes Conversations</Text>
        <View style={styles.container}>
          {conversations.length === 0 ? (
            <Text style={styles.noConversationText}>Aucune conversation pour le moment.</Text>
          ) : (
            <FlatList
              data={conversations}
              keyExtractor={(item) => item._id.toString()}
              renderItem={({ item }) => {
                console.log("Données de l'événement :", item.eventId);

                const lastMessage = item.messages?.[item.messages.length - 1];
                const lastMessageText = lastMessage ? lastMessage.content : 'Aucun message';
                const lastTime = lastMessage
                  ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                const otherParticipants = (item.participants || [])
                  .filter(p => p._id !== userId);
                const otherNames = otherParticipants.map(p => p.username).join(', ');

                const conversationDisplayName =
                  item.eventId?.title
                    ? `${item.eventId.title} - ${otherNames}`
                    : (otherNames || 'Conversation');

                    const imageUrl = item.eventId?.image 
                    ? item.eventId.image 
                    : item.eventId?.imageUrl 
                    ? item.eventId.imageUrl
                    : item.eventId?.photos?.length > 0 
                    ? item.eventId.photos[0]
                    : null;
                  
                console.log("Image URL finale :", imageUrl);

                return (
                  <Swipeable
                    renderRightActions={() => (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteConversation(item._id)}
                      >
                        <FontAwesome5 name="trash" size={24} color="white" />
                      </TouchableOpacity>
                    )}
                  >
                    <TouchableOpacity
                      style={styles.conversationItem}
                      onPress={() => navigation.navigate('Messaging', {
                        conversationId: item._id,
                        conversationName: conversationDisplayName,
                      })}
                    >
                      <View style={styles.conversationRow}>
                        {imageUrl && (
                          <Image source={{ uri: imageUrl }} style={styles.eventImage} />
                        )}
                        <View style={styles.conversationContent}>
                          <Text style={styles.conversationName}>{conversationDisplayName}</Text>
                          <Text style={styles.lastMessage}>{lastMessageText}</Text>
                        </View>
                      </View>
                      <Text style={styles.time}>{lastTime}</Text>
                    </TouchableOpacity>
                  </Swipeable>
                );
              }}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#20135B',
    fontWeight: 'bold',
    padding: 10,
    marginTop: 70,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
   
  },
  noConversationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center',
    marginTop: 50,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#20135B',
    borderWidth: 1,
    backgroundColor: '#F1F0F0'
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginVertical: 10,
    borderRadius: 10,
  },
  conversationRow: {
    flexDirection: 'row', // ✅ Met l'image et le texte sur la même ligne
    alignItems: 'center', // ✅ Aligne verticalement
  },
  eventImage: {
    width: 50,  // ✅ Largeur de l’image
    height: 50, // ✅ Hauteur de l’image
    borderRadius: 10, // ✅ Coins arrondis
    marginRight: 10, // ✅ Espacement entre l’image et le texte
  },
  
  

});
