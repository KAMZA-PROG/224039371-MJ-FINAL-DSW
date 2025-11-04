import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function Onboarding1({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/01-OnboardingPage/Onboarding1.png')} style={styles.image} />
      <Text style={styles.title}>Discover Top Hotels</Text>
      <Text style={styles.text}>Explore luxury and budget-friendly hotels around you.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Onboarding2')}>
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  image: { width: 300, height: 250, marginBottom: 30, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  text: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 10, width: '60%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
