import React, { useState, useCallback } from 'react';
import {
  SafeAreaView, View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const BACKEND_URL = 'https://backend-city-connect.vercel.app';

export default function MessageBoxScreen() {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  // 1. Récupérer userId (via /auth/profile)
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

  // 2. Charger les conversations
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
        setConversations(data); // Tableau de conv
      } else {
        console.error('Erreur API :', data.message);
      }
    } catch (error) {
      console.error('Erreur récupération conversations :', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  //3.2

  // 3. Suppression d'une conversation
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
        setConversations(prevConversations => prevConversations.filter(c => c._id !== conversationId));
        Alert.alert("Succès", "Conversation supprimée !");
      } else {
        const errorMsg = await response.text();
        Alert.alert("Erreur", errorMsg || "Impossible de supprimer la conversation.");
      }
    } catch (error) {
      console.error("Erreur suppression conversation:", error);
      Alert.alert("Erreur", "Impossible de supprimer la conversation.");
    }
  };


  // 3. useFocusEffect pour (re)charger en revenant sur cet écran
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUserId().then(() => fetchConversations());
    }, [])
  );

  // 4. Ouvrir une conversation → MessageScreen
  const handleOpenConversation = (conversation) => {
    // Titre, par exemple "Nom de l’événement - Participant(s)" ou un fallback
    let conversationTitle = 'Conversation';
    if (conversation.eventId?.title) {
      conversationTitle = conversation.eventId.title; 
    }
    // Redirection
    navigation.navigate('Messaging', {
      conversationId: conversation._id,
      conversationName: conversationTitle,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#20135B" style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Mes Conversations</Text>
      </View>

      <View style={styles.container}>
        {conversations.length === 0 ? (
          <Text style={styles.noConversationText}>Aucune conversation pour le moment.</Text>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => {
              const lastMessage = item.messages?.[item.messages.length - 1];
              const lastMessageText = lastMessage ? lastMessage.content : 'Aucun message';
              const lastTime = lastMessage
                ? new Date(lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              // Récupère les noms des participants SAUF le mien
              const otherParticipants = (item.participants || [])
                .filter(p => p._id !== userId);
              const otherNames = otherParticipants.map(p => p.username).join(', ');
              
              // Exemple d’affichage : "TitreDeLEvent - Bob, Alice"
              const conversationDisplayName =
                item.eventId?.title
                  ? `${item.eventId.title} - ${otherNames}`
                  : (otherNames || 'Conversation');

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
    onPress={() => handleOpenConversation(item)}
  >
    <View style={styles.conversationContent}>
      <Text style={styles.conversationName}>
        {conversationDisplayName}
      </Text>
      <Text style={styles.lastMessage}>{lastMessageText}</Text>
    </View>
    <Text style={styles.time}>{lastTime}</Text>
  </TouchableOpacity>
</Swipeable>

              );
            }}
          />
        )}
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    color: '#20135B',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 10,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
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
});
