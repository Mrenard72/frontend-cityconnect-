import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, Image, ImageBackground 
} from 'react-native';

// 📌 Écran du tableau de bord (DashboardScreen)
const DashboardScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <View style={styles.container}>
        {/* 🏙️ Logo de l'application */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Tableau de bord</Text>

        {/* 📌 Carte "J'explore" → Navigue vers `ExploreScreen` */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Explore')}>
          <Image source={require('../../assets/explore.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>J'explore</Text>
          </View>
        </TouchableOpacity>

        {/* 📌 Carte "Je fais découvrir" → Navigue vers `DiscoverScreen` */}
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Discover')}>
          <Image source={require('../../assets/discover.jpg')} style={styles.cardImage} />
          <View style={styles.overlay}>
            <Text style={styles.cardText}>Je fais découvrir</Text>
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
    marginBottom: 20,
  },
  card: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardText: {
    fontSize: 22,
    fontFamily: 'FredokaOne',
    color: 'white',
    textAlign: 'center',
    marginTop: 'auto',
    marginBottom: 10,
    paddingVertical: 5,
  },
  logoutButton: {
    backgroundColor: '#E53935',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'FredokaOne',
  },
});

export default DashboardScreen;
