import React, { useState, useEffect } from 'react';
import { 
  SafeAreaView, View, Text, TextInput, TouchableOpacity, 
  FlatList, StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = () => {
  const route = useRoute();
  const { conversationId } = route.params; // On récupère uniquement le conversationId

  const [myUserId, setMyUserId] = useState(null);
  const [conversationName, setConversationName] = useState('Conversation');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // 1) Charger mon profil pour connaître mon _id
  useEffect(() => {
    async function loadProfile() {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const resp = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json();
      if (resp.ok) {
        setMyUserId(data._id);
      } else {
        console.error("Erreur profil:", data.message);
      }
    }
    loadProfile();
  }, []);

  // 2) Charger la conversation (avec eventId et messages peuplés)
  useEffect(() => {
    async function loadConversation() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const resp = await fetch(`https://backend-city-connect.vercel.app/conversations/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await resp.json();
        if (resp.ok) {
          // Utiliser eventId.title comme nom de conversation si disponible
          if (data.eventId && data.eventId.title) {
            setConversationName(data.eventId.title);
          }
          setMessages(data.messages || []);
        } else {
          console.error("Erreur API:", data.message);
        }
      } catch (err) {
        console.error("Erreur fetch conversation:", err);
      }
    }
    loadConversation();
  }, [conversationId]);

  // 3) Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      const resp = await fetch(
        `https://backend-city-connect.vercel.app/conversations/${conversationId}/message`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );
      const data = await resp.json();
      if (resp.ok) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
      } else {
        console.error("Erreur envoi message:", data.message);
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
    }
  };

  // 4) Rendu d'un message
  const renderItem = ({ item }) => {
    // Comparer l'id de l'expéditeur avec mon id pour déterminer si c'est moi
    const isMe = (item.sender && item.sender._id === myUserId);
    const senderName = item.sender?.username || 'Inconnu';
    return (
      <View style={{ marginBottom: 10 }}>
        {!isMe && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.otherMessage
        ]}>
          <Text style={styles.messageText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.title}>{conversationName}</Text>
        <FlatList
          data={messages}
          keyExtractor={(msg) => msg._id?.toString() || String(Math.random())}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
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
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  container: { flex: 1, padding: 10, backgroundColor: '#f5f5f5' },
  title: { 
    fontSize: 20, fontFamily: 'FredokaOne', textAlign: 'center', 
    marginVertical: 10 
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    marginBottom: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#F1F0F0',
    borderColor: '#20135B',
    borderWidth: 1,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E2DFEE',
    borderColor: '#20135B',
    borderWidth: 1,
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
