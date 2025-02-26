import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

const MessageScreen = ({ navigation }) => {
  const conversations = [
    { id: 1, title: 'sortie 1', content: 'Conversation 1: Lorem ipsum dolor sit amet...' },
    { id: 2, title: 'sortie 2', content: 'Conversation 2: Consectetur adipiscing elit...' },
    { id: 3, title: 'sortie 3', content: 'Conversation 3: Sed do eiusmod tempor incididunt...' },
  ];

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      <View style={styles.container}>
        <Text style={styles.title}>Mes messages</Text>
        {conversations.map((conversation) => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.filterButton}
            onPress={() =>
              navigation.navigate('Conversation', { conversation })
            }
          >
            <Text style={styles.buttonText}>{conversation.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterButton: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MessageScreen;
