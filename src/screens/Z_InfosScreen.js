import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground 
} from 'react-native';
import Header from '../components/Header';
import FontAwesome from "react-native-vector-icons/FontAwesome";

// 📌 Écran de "Mes infos"
const InfosScreen = ({ navigation }) => {

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      
      <View style={styles.container}>
        <Text style={styles.title}>Mes infos</Text>

        {/* 📌 Boutons des différentes sections */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Z1_ModifScreen')}>
          <Text style={styles.textButton}>Changer le mot de passe</Text>
          <FontAwesome name="" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Z2_DeleteScreen')}>
          <Text style={styles.textButton}>Supprimer le compte</Text>
          <FontAwesome name="" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 20,
    marginTop: 10,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 130,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 80,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#20135B',
  },
  button: {
    flexDirection: "row", // Aligner le texte et l'icône en ligne
    justifyContent: "center", // Pousse le texte à gauche et l'icône à droite
    alignItems: "center", // Centre verticalement le texte et l'icône
    backgroundColor: '#20135B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    width: '70%',
    alignItems: 'center',
    
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
  icon: {
    marginLeft: 10,
},
  logoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    opacity: 0.8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
});

export default InfosScreen;