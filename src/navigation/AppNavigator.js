import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// Import des écrans
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExploreScreen from '../screens/ExploreScreen';

// Import des icônes
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Barre de navigation en bas (Seulement après connexion)
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 60 },
        tabBarActiveTintColor: '#2D2A6E',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = 'home-outline';
          } else if (route.name === 'Carte') {
            iconName = 'map-outline';
          } else if (route.name === 'Messagerie') {
            iconName = 'chatbubble-outline';
          } else if (route.name === 'Profil') {
            iconName = 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={DashboardScreen} />
      <Tab.Screen name="Carte" component={DashboardScreen} />
      <Tab.Screen name="Messagerie" component={DashboardScreen} />
      <Tab.Screen name="Profil" component={DashboardScreen} />
    </Tab.Navigator>
  );
};

// ✅ Stack principal avec gestion de l'authentification
const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          setIsLoggedIn(false);
          return;
        }

        // Vérifier si le token est valide
        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);
        } else {
          await AsyncStorage.removeItem('token');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2D2A6E" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
  {isLoggedIn ? (
    <>
      <Stack.Screen name="Dashboard" component={BottomTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }} /> 
    </>
  ) : (
    <>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    </>
  )}
</Stack.Navigator>

  );
};

export default AppNavigator;
