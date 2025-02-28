import React from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/Header';

const MessageBoxScreen = () => {
  const navigation = useNavigation();

  // Liste des conversations (données statiques pour l'exemple)
  // a changer a la creation des routes 
  const conversations = [
    { 
      id: '1', 
      name: 'Sortie au Louvre', 
      lastMessage: 'À bientôt !', 
      time: '10:30',
      exampleMessages: [
        { id: '1', text: 'Bonjour, prêts pour la sortie ?', sender: 'other', senderName: 'Alice', time: '09:00' },
        { id: '2', text: 'Oui, à quelle heure on se rejoint ?', sender: 'me', senderName: 'Moi', time: '09:10' },
        { id: '3', text: 'Disons 14h devant l\'entrée principale.', sender: 'other', senderName: 'Alice', time: '09:15' },
      ],
    },
    { 
      id: '2', 
      name: 'Bar le 13', 
      lastMessage: 'D\'accord, merci.', 
      time: '09:45',
      exampleMessages: [
        { id: '1', text: 'Salut, c\'est toujours bon pour ce soir ?', sender: 'other', senderName: 'Tom', time: '18:00' },
        { id: '2', text: 'Oui, à quelle heure ?', sender: 'me', senderName: 'Moi', time: '18:05' },
        { id: '3', text: '20h au Bar le 13.', sender: 'other', senderName: 'Tom', time: '18:10' },
      ],
    },
  ];

  // Fonction pour naviguer vers la conversation
  const handleOpenConversation = (conversation) => {
    navigation.navigate('Messaging', { 
      conversationId: conversation.id, 
      conversationName: conversation.name, 
      exampleMessages: conversation.exampleMessages,
    });
  };

  return (
    <View style={styles.container}>
      <Header />
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.conversationItem} 
            onPress={() => handleOpenConversation(item)}
          >
            <View style={styles.conversationContent}>
              <Text style={styles.conversationName}>{item.name}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 10,
    paddingTop: 140,
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
    elevation: 2, // Pour une légère ombre
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
