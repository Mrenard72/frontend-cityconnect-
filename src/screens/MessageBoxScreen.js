import React, { useState, useCallback, useEffect } from 'react';
import { 
  SafeAreaView, View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator 
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageBoxScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fonction de récupération des conversations
  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("Token manquant !");
        return;
      }
      const response = await fetch('https://backend-city-connect.vercel.app/conversations/my-conversations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        // Si le backend ne peuple pas eventId, on peut gérer cela ici
        // Par exemple, si eventId est une chaîne (ID) on utilisera "Activité" par défaut
        const eventConversations = data.filter(convo => convo.eventId);
        setConversations(eventConversations);
      } else {
        console.error("Erreur API :", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations :", error);
    } finally {
      setLoading(false);
    }
  };

  // Recharger les conversations chaque fois que l'écran est focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [])
  );

  // Fonction appelée lorsqu'un utilisateur clique sur une conversation
  const handleOpenConversation = (conversation) => {
    // Récupérer le titre de la conversation : si eventId est un objet et contient un titre, sinon "Activité"
    const conversationTitle = 
      conversation.eventId && typeof conversation.eventId === 'object' && conversation.eventId.title
        ? conversation.eventId.title
        : "Activité";
    navigation.navigate('Messaging', { 
      conversationId: conversation._id, 
      conversationName: conversationTitle,
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#20135B" style={{ marginTop: 20 }} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {conversations.length === 0 ? (
          <Text style={styles.noConversationText}>Aucune conversation pour le moment.</Text>
        ) : (
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
                    {item.eventId && typeof item.eventId === 'object' && item.eventId.title
                      ? item.eventId.title
                      : 'Activité'}
                  </Text>
                  <Text style={styles.lastMessage}>
                    {item.messages.length > 0 ? item.messages[item.messages.length - 1].content : "Aucun message"}
                  </Text>
                </View>
                <Text style={styles.time}>
                  {item.messages.length > 0 
                    ? new Date(item.messages[item.messages.length - 1].timestamp).toLocaleTimeString() 
                    : ''}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
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
