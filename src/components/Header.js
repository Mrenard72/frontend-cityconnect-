import React from 'react';
import { View, Text, Image, StyleSheet, StatusBar, Platform } from 'react-native';

const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={require('../../assets/logo.png')} // Remplacez par le chemin vers votre logo
          style={styles.logo}
        />
        <Text style={styles.title}>CityConnect</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // Position absolue pour coller au haut de l'écran
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40, // Ajustement pour Android
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    zIndex: 1, // Assurez que le header est au-dessus des autres éléments
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80, // Hauteur fixe du header
    paddingHorizontal: 10,
  },
  logo: {
    width: 70, // Taille réduite du logo pour un meilleur alignement
    height: 50,
    resizeMode: 'contain',
    marginRight: 1, // Espacement entre le logo et le texte
  },
  title: {
    fontSize: 32,
    fontFamily: 'FredokaOne',
    color: '#20135B',
  },
});

export default Header;
