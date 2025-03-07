import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground 
} from 'react-native';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons'


// 📌 Écran de "Mes infos"
const Z_InfosScreen = ({ navigation }) => {

{/* Fleche de retour header */}
  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };
{/* Fleche de retour header */}

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      
      {/* Bouton de retour placé au-dessus du Header */}
       <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={25} color="#20135B" />
      </TouchableOpacity>
      {/* Bouton de retour placé au-dessus du Header */}

    <Header/>
        <View style={styles.container}>

          {/* Titre */}
          <Text style={styles.title}>Mes infos</Text>

          {/* ✅ Boutons des différentes sections */}

          <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Z1_ModifNameUserScreen')}>
            <Text style={styles.textButton}>Modifier vote nom</Text>
            <FontAwesome name="" size={24} color="white" style={styles.icon} />
          </TouchableOpacity>

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
  background: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 32,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // ✅ Commence juste sous le Header
    paddingTop: 50, // Ajuste l'espacement après le Header
    
  },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
  logoutButton: {
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    position: 'absolute',
    top: 60, // Position relative au haut de l'écran (ajustez selon vos besoins)
    left: 20, // Distance par rapport au bord gauche
    zIndex: 21, // Plus élevé que le zIndex du Header
    padding: 10, // Zone cliquable étendue
    backgroundColor: 'transparent', // Fond transparent pour respecter le design

  },

// Fleche de retour header
  backButton: {
    position: 'absolute',
    top: 60, // Position relative au haut de l'écran (ajustez selon vos besoins)
    left: 20, // Distance par rapport au bord gauche
    zIndex: 21, // Plus élevé que le zIndex du Header
    padding: 10, // Zone cliquable étendue
    backgroundColor: 'transparent', // Fond transparent pour respecter le design
  },
// Fleche de retour header

});

export default Z_InfosScreen;