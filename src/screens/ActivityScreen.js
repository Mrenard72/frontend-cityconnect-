import React from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView 
} from 'react-native';
import Header from '../components/Header'; // 📌 Composant d'en-tête (Header)

// ✅ Liste des activités avec titre et image associée
const activities = [
  { id: 1, title: 'Sport', image: require('../../assets/sport.jpg') },
  { id: 2, title: 'Culturel', image: require('../../assets/culturel.jpg') },
  { id: 3, title: 'Sorties', image: require('../../assets/sorties.jpg') },
  { id: 4, title: 'Culinaire', image: require('../../assets/culinaire.jpg') },
];

const ActivityScreen = ({ navigation }) => {
  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header /> {/* 📌 Ajoute le composant d'en-tête */}

      {/* 🔹 Ajout d'un `View` avec `marginTop` pour éviter le chevauchement du Header */}
      <View style={{ marginTop: 20 }} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Activité</Text> {/* 📌 Titre principal */}

        {/* 🔄 Génération dynamique des catégories */}
        {activities.map((activity) => (
          <TouchableOpacity
            key={activity.id} // 🔑 Clé unique pour chaque élément
            style={styles.activityCard} // 🎨 Style de la carte
            onPress={() => navigation.navigate('Map', { filter: 'activity', type: activity.title })} // 🚀 Navigation avec le type d'activité
          >
            <ImageBackground source={activity.image} style={styles.image} imageStyle={{ borderRadius: 10 }}>
              <View style={styles.overlay}>
                {/* 📌 Entourer le titre dans un <Text> pour éviter l'erreur */}
                <Text style={styles.activityText}>{activity.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ImageBackground>
  );
};

// ✅ Styles de l'interface utilisateur
const styles = StyleSheet.create({
  background: {
    flex: 1, // 🖼️ Prend toute la hauteur de l'écran
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1, // 📌 Permet d'ajouter du scroll si besoin
    alignItems: 'center', // 📌 Centre tous les éléments horizontalement
    paddingTop: 20, // ✅ Ajoute un espace sous le Header
    paddingBottom: 30, // 📏 Espacement en bas pour éviter que ça colle à la navigation
    width: '100%',
  },
  title: {
    fontSize: 28, // 📏 Taille du titre principal
    fontFamily: 'FredokaOne', // 🖋️ Police personnalisée
    color: '#2D2A6E', // 🎨 Bleu foncé
    marginBottom: 20, // 📏 Espacement sous le titre
    textAlign: 'center', // 📌 Centre le texte
  },
  activityCard: {
    width: '90%', // 📏 Ajuste la largeur pour un affichage propre
    height: 150, // 📏 Hauteur de chaque carte
    borderRadius: 10, // 🔵 Coins arrondis
    overflow: 'hidden', // 📌 Cache les débordements
    marginBottom: 15, // 📏 Espacement entre les cartes
    alignSelf: 'center', // ✅ Assure que chaque carte est centrée
  },
  image: {
    width: '100%', 
    height: '100%',
    justifyContent: 'flex-end', 
    alignItems: 'center', 
  },
  overlay: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  activityText: {
    fontSize: 24,
    fontFamily: 'FredokaOne',
    color: 'white',
    textAlign: 'center',
  },
});

export default ActivityScreen;
