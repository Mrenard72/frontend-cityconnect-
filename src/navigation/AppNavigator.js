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
import MapScreen from '../screens/MapScreen';
import MessageScreen from '../screens/MessageScreen';
import MessageBoxScreen from '../screens/MessageBoxScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SortiesScreen from '../screens/SortiesScreen';
import ServicesScreen from '../screens/ServicesScreen';
import RestaurantsScreen from '../screens/RestaurantsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import MyPageScreen from '../screens/MyPageScreen';

// ajout screen dans mes infos
import Z_InfosScreen from '../screens/Z_InfosScreen';
import Z1_ModifScreen from '../screens/Z1_ModifScreen';
import Z2_DeleteScreen from '../screens/Z2_DeleteScreen';

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
      <DashboardStackNav.Screen name="Restaurants" component={RestaurantsScreen} />
    </DashboardStackNav.Navigator>
  );
};

// ✅ Stack pour le profil incluant les écrans supplémentaires
const ProfileStack = createStackNavigator();

const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen 
        name="ServicesScreen" 
        component={ServicesScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen 
        name="SortiesScreen" 
        component={SortiesScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen 
        name="Z_InfosScreen" 
        component={Z_InfosScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen 
        name="Z1_ModifScreen" 
        component={Z1_ModifScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen 
        name="Z2_DeleteScreen" 
        component={Z2_DeleteScreen} 
        options={{ headerShown: false }} 
      />
      <ProfileStack.Screen
        name="MyPageScreen"
        component={MyPageScreen}
        options={{ headerShown: false }}
      />
    </ProfileStack.Navigator>
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
      <Tab.Screen name="Carte" component={MapScreen} />
      {/* 💬 Onglet Messagerie */}
      <Tab.Screen name="Messagerie" component={MessageStack} />
      {/* 👤 Onglet Profil */}
      <Tab.Screen name="Profil" component={ProfileStackScreen} />
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
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
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
          <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Message" component={MessageScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Sorties" component={SortiesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Services" component={ServicesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfileScreen" component={UserProfileScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
