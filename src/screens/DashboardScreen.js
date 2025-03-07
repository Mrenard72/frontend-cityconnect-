import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground 
} from 'react-native';
import Header from '../components/Header';

// 📌 Écran du tableau de bord (DashboardScreen)
const DashboardScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header/>
      <Text style={styles.title}>Tableau de bord</Text>
      <View style={styles.container}>
        {/* 🏙️ Logo de l'application */}
     

        {/* 📌 Carte "J'explore" → Navigue vers `ExploreScreen` */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('../../assets/explore.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>J'explore</Text>
          </View>
        </TouchableOpacity>

        {/* 📌 Carte "Je fais découvrir" → Navigue vers `DiscoverScreen` */}
        <TouchableOpacity style={styles.card} onPress={() => {
            navigation.navigate('Carte', {
              filter: 'createActivity',
              // vous pouvez aussi passer userLocation, userId, etc. si besoin
            });
          }}>
          <Image source={require('../../assets/discover.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>Je fais découvrir</Text>
          </View>
        </TouchableOpacity>
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
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
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
    marginBottom:10,
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
    color: 'white',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 50,
  },
  cardTextEnSavoirPlus: {
    fontSize: 30,
    fontFamily: 'FredokaOne',
    color: '#20135B', // ✅ Couleur changée ici
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 50,
  }
});

export default DashboardScreen;
