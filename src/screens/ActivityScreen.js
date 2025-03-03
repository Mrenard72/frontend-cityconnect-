import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ImageBackground, ScrollView, Alert 
} from 'react-native';
import Header from '../components/Header';
import * as Location from 'expo-location';

const activities = [
  { id: 1, title: 'Sport', image: require('../../assets/sport.jpg') },
  { id: 2, title: 'Culturel', image: require('../../assets/culturel.jpg') },
  { id: 3, title: 'Sorties', image: require('../../assets/sorties.jpg') },
  { id: 4, title: 'Culinaire', image: require('../../assets/culinaire.jpg') },
];

const ActivityScreen = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);

  // Récupérer la localisation dès le montage de l'écran
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'La localisation est nécessaire pour cette fonctionnalité.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  return (
    <ImageBackground source={require('../../assets/background.png')} style={styles.background}>
      <Header />
      {/* Pour éviter le chevauchement avec le Header */}
      <View style={{ marginTop: 60 }} />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Activité</Text>
        {activities.map(activity => (
          <TouchableOpacity
            key={activity.id}
            style={styles.activityCard}
            onPress={() => {
              if (activity.title === "Culinaire") {
                navigation.navigate('Restaurants', { userLocation });
              } else {
                navigation.navigate('Carte', {
                  filter: 'activity', 
                  category: activity.title, 
                  userLocation,
                });
              }
            }}
          >
            <ImageBackground 
              source={activity.image} 
              style={styles.image} 
              imageStyle={{ borderRadius: 10 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.activityText}>{activity.title}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
        
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: 'FredokaOne',
    color: '#2D2A6E',
    marginBottom: 20,
    textAlign: 'center',
  },
  activityCard: {
    width: '90%',
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 15,
    alignSelf: 'center',
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
  button: {
    backgroundColor: '#2D2A6E',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'FredokaOne',
    fontSize: 16,
  },
});

export default ActivityScreen;
