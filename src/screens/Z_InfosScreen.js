import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground 
} from 'react-native';
import Header from '../components/Header';
import { FontAwesome } from '@expo/vector-icons';

/**
 * Z_InfosScreen - Écran d'informations utilisateur
 * Ce composant affiche les options permettant à l'utilisateur de modifier ses informations personnelles
 * @param {object} navigation - Objet de navigation fourni par React Navigation
 */
const Z_InfosScreen = ({ navigation }) => {

  /**
   * Gère le retour à l'écran précédent
   * Journalise l'action et utilise la navigation pour revenir en arrière
   */
  const handleGoBack = () => {
    console.log("Bouton de retour pressé");
    navigation.goBack();
  };

  return (
    // Image de fond pour tout l'écran
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      
      {/* 
        Bouton de retour 
        Positionné en haut à gauche et au-dessus du header avec un z-index élevé
        Utilise une icône FontAwesome pour la flèche de retour
      */}
      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
        <FontAwesome name="arrow-left" size={25} color="#20135B" />
      </TouchableOpacity>

      {/* Composant Header réutilisable */}
      <Header/>

      {/* Conteneur principal pour le contenu de la page */}
      <View style={styles.container}>

        {/* Titre principal de la page */}
        <Text style={styles.title}>Mes infos</Text>

        {/* 
          Boutons de navigation vers différentes sections de modification des informations
          Chaque bouton redirige vers un écran spécifique
        */}

        {/* Bouton pour modifier le nom d'utilisateur */}
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate('Z1_ModifNameUserScreen')}
        >
          <Text style={styles.textButton}>Modifier vote nom</Text>
          <FontAwesome name="" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        {/* Bouton pour changer le mot de passe */}
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate('Z1_ModifScreen')}
        >
          <Text style={styles.textButton}>Changer le mot de passe</Text>
          <FontAwesome name="" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        {/* Bouton pour supprimer le compte utilisateur */}
        <TouchableOpacity 
          style={styles.button} 
          activeOpacity={0.8} 
          onPress={() => navigation.navigate('Z2_DeleteScreen')}
        >
          <Text style={styles.textButton}>Supprimer le compte</Text>
          <FontAwesome name="" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>
      
      </View>
    </ImageBackground>
  );
};

/**
 * Styles pour le composant
 * Définit l'apparence visuelle de tous les éléments de l'interface
 */
const styles = StyleSheet.create({
  // Style pour l'image d'arrière-plan qui couvre tout l'écran
  background: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  
  // Style pour le titre principal de la page
  title: {
    fontSize: 32,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 20,
  },
  
  // Conteneur principal pour centrer le contenu sur l'écran
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Centre le contenu verticalement
    paddingTop: 50, // Espace entre le header et le contenu
  },
  
  // Style commun pour tous les boutons d'action
  button: {
    flexDirection: "row", // Affiche texte et icône sur la même ligne
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#20135B', // Couleur de fond bleu foncé
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8, // Coins arrondis
    marginVertical: 10, // Espacement vertical entre les boutons
    width: '70%', // Largeur relative à l'écran
    alignItems: 'center',
  },
  
  // Style pour le texte des boutons
  textButton: {
    color: '#FFFFFF', // Texte blanc
    fontSize: 20,
    fontFamily: 'FredokaOne', // Police personnalisée
  },
  
  // Style pour le bouton de déconnexion (non utilisé dans ce composant)
  logoutButton: {
    backgroundColor: '#E53935', // Rouge
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '50%',
    alignItems: 'center',
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 21,
    padding: 10,
    backgroundColor: 'transparent',
  },

  // Style pour le bouton de retour en haut à gauche
  backButton: {
    position: 'absolute', // Positionnement absolu par rapport au parent
    top: 60, // Distance depuis le haut
    left: 20, // Distance depuis la gauche
    zIndex: 21, // Assure que le bouton est au-dessus des autres éléments
    padding: 10, // Agrandit la zone cliquable
    backgroundColor: 'transparent', // Fond transparent
  },
});

export default Z_InfosScreen;