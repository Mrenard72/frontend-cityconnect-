import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, ImageBackground, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // ✅ Fonction de suppression
  const handleDeleteConversation = async (conversationId) => {
    if (!conversationId) {
      Alert.alert("Erreur", "ID de conversation invalide");
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${BACKEND_URL}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // ✅ Supprime la conversation de l'affichage
        setConversations((prevConversations) => 
          prevConversations.filter(convo => convo._id !== conversationId)
        );
        Alert.alert("Succès", "Conversation supprimée !");
      } else {
        Alert.alert("Erreur", "Impossible de supprimer la conversation.");
      }
    } catch (error) {
      console.error("Erreur suppression conversation:", error);
      Alert.alert("Erreur", "Impossible de supprimer la conversation.");
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
                const lastMessage = item.messages?.[item.messages.length - 1];
                const lastMessageText = lastMessage
  ? (lastMessage.content.length > 10 ? `${lastMessage.content.slice(0, 15)}...` : lastMessage.content)
  : 'Pas encore de message';

                const lastTime = lastMessage
                  ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';

                const senderName = lastMessage?.sender?.username ;
                const conversationDisplayName = item.eventId?.title || 'Conversation';

                const imageUrl = item.eventId?.image 
                  ? item.eventId.image 
                  : item.eventId?.imageUrl 
                  ? item.eventId.imageUrl
                  : item.eventId?.photos?.length > 0 
                  ? item.eventId.photos[0]
                  : null;
              
                return (
                  <View style={styles.conversationItem}>
                    <TouchableOpacity
                      style={styles.conversationRow}
                      onPress={() => navigation.navigate('Messaging', {
                        conversationId: item._id,
                        conversationName: conversationDisplayName,
                      })}
                    >
                      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.eventImage} />}
                      <View style={styles.conversationContent}>
                        <Text style={styles.conversationName}>{conversationDisplayName}</Text>
                        <View style={styles.lastMessageContainer}>
                          <Text style={styles.senderName}>{senderName} :</Text>
                          <Text style={styles.lastMessage}>{lastMessageText}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                    {/* ✅ Icône poubelle cliquable */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteConversation(item._id)}
                    >
                      <FontAwesome5 name="trash" size={24} color="#20135B" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}



// supprimer une conv 

const handleDeleteConversation = async (conversationId) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    const response = await fetch(`${BACKEND_URL}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      // ✅ Supprime la conversation de l'état
      setConversations((prevConversations) => 
        prevConversations.filter(convo => convo._id !== conversationId)
      );
      Alert.alert("Succès", "Conversation supprimée !");
    } else {
      Alert.alert("Erreur", "Impossible de supprimer la conversation.");
    }
  } catch (error) {
    console.error("Erreur suppression conversation:", error);
    Alert.alert("Erreur", "Impossible de supprimer la conversation.");
  }
};


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
    fontFamily: 'FredokaOne',
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  
  },
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventImage: {
    width: 70,
    height: 70,
    borderRadius: 40,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#20135B',
  },
  conversationContent: {
    flex: 1,
  
  },
  conversationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20135B',
    marginBottom: 4,
    fontFamily: 'FredokaOne',
  },
  lastMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  senderName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginRight: 5,
    fontFamily: 'FredokaOne',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-start',
    marginLeft: -30,
  },
  deleteButton: {
  marginLeft: -30, // ✅ Décale légèrement l'icône vers la droite
  padding: 10, // ✅ Ajoute un peu d'espace autour pour un clic facile
},

});