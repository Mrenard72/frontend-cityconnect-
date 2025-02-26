import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ConversationScreen = ({ route }) => {
  const { conversation } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{conversation.title}</Text>
      <Text style={styles.content}>{conversation.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D2A6E',
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
});

export default ConversationScreen;
