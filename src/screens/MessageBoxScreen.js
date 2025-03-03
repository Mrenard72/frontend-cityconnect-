import React, { useEffect, useState } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageBoxScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]); // Stocke les conversations de l'utilisateur
  const [loading, setLoading] = useState(true); // État pour afficher un indicateur de chargement

  // 📌 Récupérer les conversations depuis l’API au chargement du composant
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // 🔑 Récupération du token utilisateur
        if (!token) {
          console.error("Token manquant !");
          return;
        }
  
        // 🔗 Requête GET pour récupérer les conversations de l’utilisateur
        const response = await fetch('https://backend-city-connect.vercel.app/conversations/my-conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
        if (response.ok) {
          // Filtrer pour afficher uniquement les conversations liées aux événements
          const eventConversations = data.filter(convo => convo.eventId);
          setConversations(eventConversations);
        } else {
          console.error("Erreur API :", data.message);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des conversations :", error);
      } finally {
        setLoading(false); // ❌ Désactive l’indicateur de chargement
      }
    };
  
    fetchConversations();
  }, []);
  
  // 📌 Fonction appelée lorsqu'un utilisateur clique sur une conversation
  const handleOpenConversation = (conversation) => {
    navigation.navigate('Messaging', { 
      conversationId: conversation._id, // 🔗 Passe l'ID de la conversation
      conversationName: conversation.eventId ? conversation.eventId.title : 'Conversation', // 📌 Affiche le nom de l'événement
    });
  };

  // 🎡 Affiche un indicateur de chargement si les données ne sont pas encore récupérées
  if (loading) {
    return <ActivityIndicator size="large" color="#20135B" style={{ marginTop: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem} 
            onPress={() => handleOpenConversation(item)}
          >
            <View style={styles.conversationContent}>
              <Text style={styles.conversationName}>
                {item.eventId ? item.eventId.title : 'Conversation'}
              </Text>
              <Text style={styles.lastMessage}>
                {item.messages.length > 0 ? item.messages[item.messages.length - 1].content : "Aucun message"}
              </Text>
            </View>
            <Text style={styles.time}>
              {item.messages.length > 0 ? new Date(item.messages[item.messages.length - 1].timestamp).toLocaleTimeString() : ''}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

// 🎨 Styles pour la mise en page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noConversationText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#777',
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
    width: '100%',
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
  },
});

export default MessageBoxScreen;
