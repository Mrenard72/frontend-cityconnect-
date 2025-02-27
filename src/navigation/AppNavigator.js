import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

// 📌 Import des écrans principaux de l'application
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ExploreScreen from '../screens/ExploreScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MessageScreen from '../screens/MessageScreen';
import MessageBoxScreen from '../screens/MessageBoxScreen';
import ActivityScreen from '../screens/ActivityScreen';

// 📌 Import des icônes pour la barre de navigation
import { Ionicons } from '@expo/vector-icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Nouvelle stack pour la gestion des messages
const MessageStack = () => {
  const MessageStackNav = createStackNavigator();

  return (
    <MessageStackNav.Navigator screenOptions={{ headerShown: false }}>
      {/* Liste des conversations */}
      <MessageStackNav.Screen name="MessageBox" component={MessageBoxScreen} />
      {/* Écran individuel pour une conversation */}
      <MessageStackNav.Screen name="Messaging" component={MessageScreen} />
    </MessageStackNav.Navigator>
  );
};


// ✅ Stack interne pour inclure `ExploreScreen` dans les onglets (et garder la navigation intacte)
const DashboardStack = () => {
  const DashboardStackNav = createStackNavigator();

  return (
    <DashboardStackNav.Navigator screenOptions={{ headerShown: false }}>
      <DashboardStackNav.Screen name="DashboardMain" component={DashboardScreen} />
      <DashboardStackNav.Screen name="Explore" component={ExploreScreen} />
      <DashboardStackNav.Screen name="Activity" component={ActivityScreen} />
    </DashboardStackNav.Navigator>
  );
};

// ✅ Barre de navigation en bas avec les onglets principaux
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#FFFFFF', height: 60 }, // 📌 Style de la barre d'onglets
        tabBarActiveTintColor: '#2D2A6E', // 📌 Couleur du texte actif
        tabBarInactiveTintColor: 'gray', // 📌 Couleur du texte inactif
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = 'home-outline'; // 🏠 Icône pour l'accueil
          } else if (route.name === 'Carte') {
            iconName = 'map-outline'; // Icône pour la carte
          } else if (route.name === 'Messagerie') {
            iconName = 'chatbubble-outline'; // 💬 Icône pour la messagerie
          } else if (route.name === 'Profil') {
            iconName = 'person-outline'; // 👤 Icône pour le profil
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    > 
    {/* 📌 Onglet Accueil (contient aussi ExploreScreen via DashboardStack) */}
      <Tab.Screen name="Accueil" component={DashboardStack} />
        {/* Onglet Carte */}
      <Tab.Screen name="Carte" component={DashboardScreen} />
      {/* 💬 Onglet Messagerie */}
      <Tab.Screen name="Messagerie" component={MessageStack} />
      {/* 👤 Onglet Profil */}
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// ✅ Stack principal avec gestion de l'authentification
const AppNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // 📌 État pour suivre la connexion de l'utilisateur

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token'); // 🔑 Vérification du token utilisateur
        if (!token) {
          setIsLoggedIn(false); // 🚫 Pas de token → utilisateur non connecté
          return;
        }

         // 🔍 Vérifier si le token est valide en appelant l'API backend
        const response = await fetch('https://backend-city-connect.vercel.app/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setIsLoggedIn(true);  // ✅ Le token est valide → utilisateur connecté
        } else {
          await AsyncStorage.removeItem('token'); // 🚫 Supprimer un token invalide
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        setIsLoggedIn(false);
      }
    };
    
    checkLoginStatus();
  }, []);

  // ⏳ Si l'état de connexion n'est pas encore déterminé, afficher un **loader**
  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2D2A6E" /> 
      </View>
    );
  }
        // ✅ Gestion de la navigation selon l'état de connexion
  return (
    <Stack.Navigator>
      {isLoggedIn ? (
        <>
         {/* 🏠 Si l'utilisateur est connecté, afficher le dashboard avec les onglets */}
          <Stack.Screen name="Dashboard" component={BottomTabs} options={{ headerShown: false }} />
          
        </>
      ) : (
        <>
          {/* 🚪 Si l'utilisateur N'EST PAS connecté, afficher les écrans d'authentification */}
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
          
          <Stack.Screen name="Dashboard" component={BottomTabs} options={{ headerShown: false }} />
          <Stack.Screen name="Explore" component={ExploreScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Activity" component={ActivityScreen} options={{ headerShown: false }} />
          
        </>
      )}
    </Stack.Navigator>

    
  );
};

export default AppNavigator;
