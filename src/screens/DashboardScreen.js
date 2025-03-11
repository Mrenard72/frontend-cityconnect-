import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground 
} from 'react-native';
import Header from '../components/Header';
import { useTranslation } from 'react-i18next';

const DashboardScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  
  // Labels traduits
  const [visibleLabels, setVisibleLabels] = useState(["", ""]);

  useEffect(() => {
    const labels = [t('dashboard.explore'), t('dashboard.discover')]; // Utilisation correcte des clés de traduction
    setVisibleLabels(labels.map(() => "")); // Réinitialise les labels à chaque changement de langue

    labels.forEach((label, index) => {
      label.split("").forEach((_, charIndex) => {
        setTimeout(() => {
          setVisibleLabels((prev) => {
            const newText = [...prev];
            newText[index] = label.slice(0, charIndex + 1);
            return newText;
          });
        }, index * 1500 + charIndex * 70);
      });
    });
  }, [i18n.language]); //  Met à jour les labels si la langue change

  // 📌 Fonction pour changer la langue
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      
      {/* Drapeaux pour changer la langue */}
      <View style={styles.languageSwitcher}>
        <TouchableOpacity onPress={() => changeLanguage('fr')}>
          <Image source={require('../../assets/france.png')} style={styles.flag} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => changeLanguage('en')}>
          <Image source={require('../../assets/anglais.png')} style={styles.flag} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{t('dashboard.title')}</Text>

      <View style={styles.container}>
        {/* 📌 Carte "J'explore" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('../../assets/explore.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>{visibleLabels[0]}</Text> 
          </View>
        </TouchableOpacity>

        {/* 📌 Carte "Je fais découvrir" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Carte', { fromDiscover: true }, { filter: 'createActivity' })}>
          <Image source={require('../../assets/discover.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>{visibleLabels[1]}</Text>
          </View>
        </TouchableOpacity>

        {/* 📌 Bouton "En savoir +" */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Doc')}>
          <View style={styles.overlay}>
            <Text style={styles.cardTextEnSavoirPlus}>{t('dashboard.learnMore')}</Text>
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
  languageSwitcher: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    right: 20,
  },
  flag: {
    width: 40,
    height: 30,
    marginHorizontal: 5,
    borderRadius: 5,
    marginTop: 140,
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
    fontFamily: 'FredokaOne',
    color: '#20135B',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.6)'
  },
  cardTextEnSavoirPlus: {
    fontSize: 15,
    fontFamily: 'FredokaOne',
    color: '#20135B',
    textAlign: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: '#20135B',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(142, 204, 252, 0.6)',
    alignSelf: 'center',
    marginBottom: 10,
  },
});

export default DashboardScreen;
