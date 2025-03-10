import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next'; // ✅ Importation pour la traduction

const DocScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); // ✅ Activation de la traduction

  // Étapes traduites
  const steps = [
    t('docs.welcome'),
    `📍 ${t('docs.exploreTitle')}`,
    t('docs.exploreDescription'),
    t('docs.exploreFilters'),
    t('docs.exploreDate'),
    `📌 ${t('docs.discoverTitle')}`,
    t('docs.discoverDescription'),
    t('docs.discoverShare')
  ];
  
  const [visibleText, setVisibleText] = useState(steps.map(() => ""));
  
  useEffect(() => {
    const newSteps = [
      t('docs.welcome'),
      `📍 ${t('docs.exploreTitle')}`,
      t('docs.exploreDescription'),
      t('docs.exploreFilters'),
      t('docs.exploreDate'),
      `📌 ${t('docs.discoverTitle')}`,
      t('docs.discoverDescription'),
      t('docs.discoverShare')
    ];
    
    setVisibleText(newSteps.map(() => "")); // Réinitialisation des textes

    newSteps.forEach((step, stepIndex) => {
      step.split("").forEach((_, charIndex) => {
        setTimeout(() => {
          setVisibleText((prev) => {
            const newText = [...prev];
            newText[stepIndex] = step.slice(0, charIndex + 1);
            return newText;
          });
        }, stepIndex * 2000 + charIndex * 50);
      });
    });
  }, [i18n.language]); // 🔥 Mise à jour automatique lors du changement de langue

  // ✅ Retour à la page précédente en cliquant sur le logo
  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleGoBack}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
        </TouchableOpacity>

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

