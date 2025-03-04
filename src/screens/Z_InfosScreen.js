import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground 
} from 'react-native';
import Header from '../components/Header';
import FontAwesome from "react-native-vector-icons/FontAwesome";

// 📌 Écran de "Mes infos"
const InfosScreen = ({ navigation }) => {

  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
       {/* Bouton de retour placé au-dessus du Header */}
       <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={25} color="#20135B" />
      </TouchableOpacity>
      <Header />

      <View style={styles.container}>
        {/* ✅ Boutons des différentes sections */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Z1_ModifScreen')}>
          <Text style={styles.textButton}>Changer le mot de passe</Text>
          <FontAwesome name="lock" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={() => navigation.navigate('Z2_DeleteScreen')}>
          <Text style={styles.textButton}>Supprimer le compte</Text>
          <FontAwesome name="trash" size={24} color="white" style={styles.icon} />
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
    width: '75%',
    height: '8%'
  },
  textButton: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'FredokaOne',
  },
  icon: {
    marginLeft: 10,
  },
  backButton: {
    position: 'absolute',
    top: 60, // Position relative au haut de l'écran (ajustez selon vos besoins)
    left: 20, // Distance par rapport au bord gauche
    zIndex: 21, // Plus élevé que le zIndex du Header
    padding: 10, // Zone cliquable étendue
    backgroundColor: 'transparent', // Fond transparent pour respecter le design

  },
});

export default InfosScreen;
