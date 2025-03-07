import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground 
} from 'react-native';
import Header from '../components/Header';

const DashboardScreen = ({ navigation }) => {
  const labels = ["J'explore", "Je fais découvrir"];
  const [visibleLabels, setVisibleLabels] = useState(labels.map(() => ""));

  useEffect(() => {
    labels.forEach((label, index) => {
      label.split("").forEach((_, charIndex) => {
        setTimeout(() => {
          setVisibleLabels((prev) => {
            const newText = [...prev];
            newText[index] = label.slice(0, charIndex + 1);
            return newText;
          });
        }, index * 1500 + charIndex * 70); // Délai entre chaque lettre
      });
    });
  }, []);

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      <Text style={styles.title}>Tableau de bord</Text>
      <View style={styles.container}>
        {/* 📌 Carte "J'explore" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('../../assets/explore.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>{visibleLabels[0]}</Text> 
          </View>
        </TouchableOpacity>

        {/* 📌 Carte "Je fais découvrir" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Carte', { filter: 'createActivity' })}>
          <Image source={require('../../assets/discover.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>{visibleLabels[1]}</Text>
          </View>
        </TouchableOpacity>

        {/* 📌 Bouton "En savoir +" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Doc')}>
          <View style={styles.overlay}>
            <Text style={styles.cardTextEnSavoirPlus}>En savoir +</Text>
          </View>
        </TouchableOpacity>
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
    marginTop: 130,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 10,
    marginTop: 160,
  },
  card: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
    borderColor: '#20135B',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardText: {
    fontSize: 30,
    top: '100%',
    fontFamily: 'FredokaOne',
    color: '#20135B',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 10,  // ✅ Ajuste l'espace pour éviter que la bordure touche le texte
    paddingHorizontal: 20, // ✅ Ajoute un padding horizontal pour élargir la bordure
    borderColor: '#20135B', // ✅ Définit la couleur de la bordure (même couleur que le texte)
    backgroundColor: 'rgba(255,255,255,0.6)' // ✅ Optionnel : Ajoute un fond semi-transparent
  
  },
  cardTextEnSavoirPlus: {
    fontSize: 15,
    fontFamily: 'FredokaOne',
    color: '#20135B',
    textAlign: 'center',
    paddingVertical: 5, // ✅ Réduit l’espace au-dessus et en dessous du texte
    paddingHorizontal: 10, // ✅ Ajuste la largeur du fond autour du texte
    borderColor: '#20135B', // ✅ Couleur de la bordure
    borderWidth: 2, // ✅ Ajoute une bordure fine autour du texte
    borderRadius: 8, // ✅ Arrondi les coins pour un meilleur rendu
    backgroundColor: 'rgba(142, 204, 252, 0.6)', // ✅ Réduit la taille du fond autour du texte
    alignSelf: 'center', // ✅ Centre horizontalement sans occuper toute la largeur
    marginBottom: 10, // ✅ Garde un petit espace en bas pour l'aération
    marginTop: '50',
  }
  
});

export default DashboardScreen;

