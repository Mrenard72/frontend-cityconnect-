import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  KeyboardAvoidingView, Platform
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';

const BACKEND_URL = 'https://backend-city-connect.vercel.app';

export default function MessageScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  // Récupérés depuis MessageBoxScreen
  const { conversationId = '', conversationName = 'Conversation' } = route.params || {};

  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState('');  // Nom de l'utilisateur actuel
  const [otherParticipant, setOtherParticipant] = useState(null); // Stockage de l'autre participant
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  /********************************************************
   * Étape 1 : Récupérer le userId et le username via /auth/profile
   ********************************************************/
  useEffect(() => {
    async function loadUser() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const res = await fetch(`${BACKEND_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data._id) {
          console.log('Utilisateur actuel récupéré:', data);
          setUserId(data._id);
          setUsername(data.username || 'Moi');
        } else {
          console.log('Impossible de récupérer userId, data:', data);
        }
      } catch (err) {
        console.error('Erreur loadUser:', err);
      }
    }
    loadUser();
  }, []);

  /*********************************************************
   * Étape 2 : Charger la conversation après avoir récupéré userId
   *********************************************************/
  useEffect(() => {
    if (!userId || !conversationId) return;

    async function fetchConversation() {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        const response = await fetch(`${BACKEND_URL}/conversations/${conversationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          console.log('Echec GET conversation, status:', response.status);
          return;
        }
        const conversation = await response.json();
        console.log('Conversation récupérée :', conversation);

        // Trouver l'autre participant dans la conversation
        if (conversation.participants && conversation.participants.length > 0) {
          const other = conversation.participants.find(p => p._id !== userId);
          if (other) {
            console.log('Autre participant identifié:', other);
            setOtherParticipant(other);
            
            // Mettre à jour le nom de la conversation si nécessaire
            if (other.username && conversationName === 'Conversation') {
              navigation.setParams({ conversationName: other.username });
            }
          }
        }

        // On mappe les messages
        const loaded = conversation.messages.map((m) => {
          const isMe = m.sender && m.sender._id === userId;
          return {
            id: m._id,
            text: m.content,
            sender: isMe ? 'me' : 'other',
            // Déterminer le nom de l'expéditeur de façon plus robuste
            senderName: isMe 
              ? username 
              : (m.sender?.username || (otherParticipant?.username || 'Autre participant')),
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        });
        
        setMessages(loaded);
      } catch (err) {
        console.error('Erreur fetchConversation:', err);
      }
    }
    fetchConversation();
  }, [userId, conversationId, username, otherParticipant]);

  /*********************************************************
   * Étape 3 : Envoyer un message => POST /message
   *********************************************************/
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
  
    const tempId = Date.now().toString();
    // Message temporaire optimiste (affiché immédiatement)
    const localMsg = {
      id: tempId,
      text: newMessage,
      sender: 'me',
      senderName: username || 'Moi', // username stocké localement
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  
    setMessages((prev) => [...prev, localMsg]);
    setNewMessage('');
  
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
  
      console.log("Envoi du message à", `${BACKEND_URL}/conversations/${conversationId}/message`);
      const response = await fetch(`${BACKEND_URL}/conversations/${conversationId}/message`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: localMsg.text }),
      });
  
      if (!response.ok) {
        const status = response.status;
        const errTxt = await response.text();
        console.log(`Erreur POST message: status=${status}, body=`, errTxt);
        throw new Error('Envoi message échoué');
      }
  
      // Au lieu de se fier à la réponse immédiate, on recharge la conversation
      const convRes = await fetch(`${BACKEND_URL}/conversations/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!convRes.ok) {
        throw new Error('Impossible de recharger la conversation');
      }
      const convData = await convRes.json();
      console.log("Conversation rechargée :", convData);
  
      // Trouver l'autre participant si pas encore défini
      if (!otherParticipant && convData.participants) {
        const other = convData.participants.find(p => p._id !== userId);
        if (other) {
          console.log('Autre participant identifié après envoi:', other);
          setOtherParticipant(other);
        }
      }
  
      // Transformer les messages récupérés pour l'affichage
      const updatedMessages = convData.messages.map((m) => {
        const isCurrentUser = m.sender && m.sender._id === userId;
        return {
          id: m._id,
          text: m.content,
          sender: isCurrentUser ? 'me' : 'other',
          // Logique améliorée pour déterminer le nom de l'expéditeur
          senderName: isCurrentUser 
            ? username 
            : (m.sender?.username || (otherParticipant?.username || 'Autre participant')),
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      });
  
      setMessages(updatedMessages);
    } catch (err) {
      console.error('Erreur handleSendMessage:', err);
      // Optionnel : retirer le message temporaire en cas d'erreur
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };
  
  // Bouton de retour
  const handleGoBack = () => navigation.goBack();

  /*********************************************************
   * Rendu
   *********************************************************/
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header + bouton de retour */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#20135B" />
        </TouchableOpacity>
        <Header />
      </View>

      {/* Titre de la conversation (nom de l'autre participant) */}
      <Text style={styles.title}>
        {otherParticipant?.username || conversationName}
      </Text>

      {/* Liste des messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => (
          <View style={[
            styles.messageContainer,
            item.sender === 'me' ? styles.myMessageContainer : styles.otherMessageContainer
          ]}>
            <Text style={[
              styles.senderName,
              item.sender === 'me' ? styles.mySenderName : styles.otherSenderName
            ]}>
              {item.sender === 'me' ? 'Moi' : item.senderName}
            </Text>
            <View
              style={[
                styles.messageBubble,
                item.sender === 'me' ? styles.myMessage : styles.otherMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        )}
      />

      {/* Zone d'entrée de message */}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 21,
    padding: 5,
  },
  title: {
    marginTop: 130,
    fontSize: 22,
    color: '#20135B',
    fontFamily: 'FredokaOne',
    textAlign: 'center',
  },
  messagesContainer: {
    padding: 10,
    paddingTop: 140,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 2,
    marginLeft: 5,
  },
  mySenderName: {
    color: '#20135B',
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  otherSenderName: {
    color: '#555',
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
  },
  myMessage: {
    backgroundColor: '#F1F0F0',
    borderWidth: 1,
    borderColor: '#20135B',
  },
  otherMessage: {
    backgroundColor: '#E2DFEE',
    borderWidth: 1,
    borderColor: '#20135B',
  },
  messageText: {
    color: '#20135B',
    fontFamily: 'FredokaOne',
    fontSize: 16,
  },
  timeText: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 5,
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