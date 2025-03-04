import React, { useState, useCallback } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageBoxScreen = () => {
  const navigation = useNavigation();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
        const eventConversations = data.filter(convo => convo.eventId);
        setConversations(eventConversations);
      } else {
        console.error("Erreur API :", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des conversations :", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchConversations();
    }, [])
  );

  const handleOpenConversation = (conversation) => {
    let conversationTitle = 'Conversation';
    if (conversation.eventId && typeof conversation.eventId === 'object' && conversation.eventId.title) {
      conversationTitle = conversation.eventId.title;
    } else if (conversation.eventId) {
      conversationTitle = "Activité";
    }
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
      <View style={styles.container}>
        {conversations.length === 0 ? (
          <Text style={styles.noConversationText}>Aucune conversation pour le moment.</Text>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item._id.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.conversationItem} 
                onPress={() => handleOpenConversation(item)}
              >
                <View style={styles.conversationContent}>
                  <Text style={styles.conversationName}>
                    {item.eventId && typeof item.eventId === 'object' && item.eventId.title
                      ? item.eventId.title
                      : 'Conversation'}
                  </Text>
                  <Text style={styles.lastMessage}>
                    {item.messages && item.messages.length > 0 
                      ? item.messages[item.messages.length - 1].content 
                      : "Aucun message"}
                  </Text>
                </View>
                <Text style={styles.time}>
                  {item.messages && item.messages.length > 0 
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
    backgroundColor: '#f5f5f5',
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
