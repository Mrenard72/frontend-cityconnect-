import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 📌 Traductions
const resources = {
  en: {
    translation: {
      dashboard: {
        title: "Dashboard",
        explore: "Explore",
        discover: "Discover",
        learnMore: "Learn More",
      },
      profile: {
        title: "My Profile",
        addPhoto: "Add profile photo",
        loading: "Loading...",
        myServices: "My Services",
        myOutings: "My Outings",
        myInfo: "My Info",
        logout: "Logout",
        myPage: "My Page",
        addPhoto: "Add profile photo", // ✅ Texte affiché si pas d'image
        changePhoto: "Change profile photo",
        cancel: "Cancel",
        change: "Change",
        loading: "Loading...",
      },
      docs: {
        welcome: "Welcome to CityConnect!",
        exploreTitle: "I Explore:",
        exploreDescription: "Find real-time events created by the community near you or in the city of your choice.",
        exploreFilters: "🔎 Refine your search by location, activity type: sports, culture, food, outings...",
        exploreDate: "📅 Select a date to see the events available that day.",
        discoverTitle: "I Discover:",
        discoverDescription: "Add your own events and share them with the community!",
        discoverShare: "🚀 Share your passions and create meaningful connections.",
      }
      
    }
  },
  fr: {
    translation: {
      dashboard: {
        title: "Tableau de bord",
        explore: "J'explore",
        discover: "Je fais découvrir",
        learnMore: "En savoir +",
      },
      profile: {
        title: "Mon Profil",
        addPhoto: "Ajouter une photo de profil",
        loading: "Chargement...",
        myServices: "Mes services",
        myOutings: "Mes sorties",
        myInfo: "Mes infos",
        logout: "Déconnexion",
        myPage: "Ma page",
        addPhoto: "Ajouter une photo de profil", // ✅ Texte affiché si pas d'image
        changePhoto: "Changer la photo de profil",
        cancel: "Annuler",
        change: "Changer",
        loading: "Chargement...",
        photoUpdated: "Photo de profil mise à jour !"
      },
      docs: {
        welcome: "Bienvenue sur CityConnect !",
        exploreTitle: "J'explore :",
        exploreDescription: "Trouvez des événements en temps réel créés par la communauté près de chez vous ou dans la ville de votre choix.",
        exploreFilters: "🔎 Affinez votre recherche par localisation, type d’activité : sport, culture, gastronomie, sorties…",
        exploreDate: "📅 Sélectionnez une date pour voir les événements disponibles ce jour-là.",
        discoverTitle: "Je fais découvrir :",
        discoverDescription: "Ajoutez vos propres événements et partagez avec la communauté !",
        discoverShare: "🚀 Partagez vos passions et créez des rencontres enrichissantes.",
      }
      
    }
  }
};

// 📌 Détection automatique et stockage de la langue
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLang = await AsyncStorage.getItem('appLanguage');
      if (storedLang) {
        callback(storedLang);
        return;
      }

      const locale = Localization.getLocales()[0]?.languageCode || 'en';
      const detectedLang = locale === 'fr' ? 'fr' : 'en';

      await AsyncStorage.setItem('appLanguage', detectedLang);
      callback(detectedLang);
    } catch (error) {
      console.error("Erreur lors de la détection de la langue:", error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (lang) => {
    try {
      await AsyncStorage.setItem('appLanguage', lang);
    } catch (error) {
      console.error("Erreur lors du stockage de la langue:", error);
    }
  },
};

// 📌 Initialisation de i18n
i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
