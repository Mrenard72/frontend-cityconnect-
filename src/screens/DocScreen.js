import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native';

const DocScreen = () => {
  const steps = [
    "Bienvenue sur CityConnect !",
    "📍 J'explore : ",
    "Trouvez des événements en temps réel créés par la communauté près de chez vous ou dans la ville de votre choix.",
    "🔎 Affinez votre recherche par localisation, type d’activité : sport, culture, gastronomie, sorties…",
    "📅 Sélectionnez une date pour voir les événements disponibles ce jour-là.",
    "📌 Je fais découvrir : ",
    " Ajoutez vos propres événements et partagez avec la communauté !",
    "🚀 Partagez vos passions et créez des rencontres enrichissantes."
  ];
  
  const [visibleText, setVisibleText] = useState(steps.map(() => ""));
  
  useEffect(() => {
    steps.forEach((step, stepIndex) => {
      step.split("").forEach((_, charIndex) => {
        setTimeout(() => {
          setVisibleText((prev) => {
            const newText = [...prev];
            newText[stepIndex] = step.slice(0, charIndex + 1);
            return newText;
          });
        }, stepIndex * 2000 + charIndex * 50); // Délai entre chaque lettre
      });
    });
  }, []);

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
    <View style={styles.container}>
         <Image source={require('../../assets/logo.png')} style={styles.logo} />
      {visibleText.map((step, index) => (
        <Text key={index} style={styles.text}>{step}</Text>
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
   
    padding: 20
  },
  text: {
    fontSize: 18,
    fontFamily: 'FredokaOne',
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  }
});

export default DocScreen;
