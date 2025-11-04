import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function Onboarding2({ navigation }) {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/01-OnboardingPage/Onboarding2.png')} style={styles.image} />
      <Text style={styles.title}>Easy Booking</Text>
      <Text style={styles.text}>Book your stay with just a few taps and enjoy exclusive deals.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Onboarding3')}>
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
