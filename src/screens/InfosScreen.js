import React, { useEffect, useState } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Alert, ImageBackground 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Header from '../components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import FontAwesome from "react-native-vector-icons/FontAwesome";

    <View style={styles.container}>

        {/* 📌 Boutons des différentes sections */}
        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes services</Text>
          <FontAwesome name="list-alt" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes sorties</Text>
          <FontAwesome name="calendar" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

          {/* 📌 Bouton section "Mes infos" */}
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('')} activeOpacity={0.8}>
          <Text style={styles.textButton}>Mes infos</Text>
          <FontAwesome name="id-card" size={24} color="white" style={styles.icon} />
        </TouchableOpacity>

    </View>
