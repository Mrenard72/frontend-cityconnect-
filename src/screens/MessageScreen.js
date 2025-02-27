import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform 
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const MessageScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { conversationId, conversationName = "Conversation", exampleMessages = [] } = route.params || {};

  const [messages, setMessages] = useState(exampleMessages);
  const [newMessage, setNewMessage] = useState('');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now().toString(), text: newMessage, sender: 'me', senderName: 'Moi', time: getCurrentTime() },
    ]);
    setNewMessage('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
       
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity 
  onPress={() => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  }} 
  style={styles.backButton}
>
  <Ionicons name="arrow-back" size={24} color="#20135B" />
</TouchableOpacity>
        <Header />
      </View>
      <Text style={styles.title}>{conversationName}</Text>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            {item.sender === 'other' && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
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
        contentContainerStyle={styles.messagesContainer}
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
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    padding: 10,
    paddingTop: 140,
  },
  backButton: {
    position: 'absolute',
    top: 70,
    left: 20,
    zIndex: 21,
    padding: 5,
    
  },
  senderName: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
    marginLeft: 5,
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
    fontSize: '16'
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
  timeText: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
});

export default MessageScreen;
