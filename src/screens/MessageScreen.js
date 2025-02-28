import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = () => {
  const route = useRoute();
  const { conversationId, conversationName } = route.params;

  const [messages, setMessages] = useState([]); // Stocke les messages de la conversation
  const [newMessage, setNewMessage] = useState(''); // Stocke le message en cours de saisie
  
  // 📌 Charger les messages au démarrage
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        // 🔗 Requête GET pour récupérer les messages de la conversation
        const response = await fetch(`https://backend-city-connect.vercel.app/conversations/${conversationId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages); // ✅ Mise à jour des messages
        } else {
          console.error("Erreur API :", data.message);
        }
      } catch (error) {
        console.error("Erreur récupération des messages :", error);
      }
    };

    fetchMessages();
  }, []);

  // 📌 Fonction pour envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // 🔗 Requête POST pour envoyer un message
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
        setMessages(prev => [...prev, data]); // ✅ Ajoute le message à la liste
        setNewMessage(''); // Réinitialise l’input
      } else {
        console.error("Erreur envoi message :", data.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    }
  };

  return (
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
        <TextInput style={styles.textInput} placeholder="Écrire un message..." value={newMessage} onChangeText={setNewMessage} />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Envoyer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default MessageScreen;
