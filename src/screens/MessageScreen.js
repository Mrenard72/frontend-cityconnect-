import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView,
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = () => {
  const route = useRoute();
  const { conversationId, conversationName } = route.params;

  const [messages, setMessages] = useState([]); // Stocke les messages de la conversation
  const [newMessage, setNewMessage] = useState(''); // Stocke le message en cours de saisie
  
  // Charger les messages au démarrage
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        // Requête GET pour récupérer les messages de la conversation
        const response = await fetch(`https://backend-city-connect.vercel.app/conversations/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages);
        } else {
          console.error("Erreur API :", data.message);
        }
      } catch (error) {
        console.error("Erreur récupération des messages :", error);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      // Requête POST pour envoyer un message
      const response = await fetch(`https://backend-city-connect.vercel.app/conversations/${conversationId}/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newMessage }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, data]); // Ajoute le message à la liste
        setNewMessage(''); // Réinitialise l’input
      } else {
        console.error("Erreur envoi message :", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Text style={styles.title}>{conversationName}</Text>

        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.sender === 'me' ? styles.myMessage : styles.otherMessage]}>
              <Text style={styles.messageText}>{item.content}</Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <TextInput 
            style={styles.textInput} 
            placeholder="Écrire un message..." 
            value={newMessage} 
            onChangeText={setNewMessage} 
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
            <Text style={styles.sendButtonText}>Envoyer</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  title: {
    fontSize: 20,
    fontFamily: 'FredokaOne',
    textAlign: 'center',
    marginVertical: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F1F0F0',
    borderWidth: 1,
    borderColor: '#20135B',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2DFEE',
    borderWidth: 1,
    borderColor: '#20135B',
  },
  messageText: {
    color: '#20135B',
    fontFamily: 'FredokaOne',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: '#f9f9f9',
  },
  sendButton: {
    backgroundColor: '#20135B',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontFamily: 'FredokaOne',
  },
});

export default MessageScreen;
