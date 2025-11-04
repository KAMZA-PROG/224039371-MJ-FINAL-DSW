import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebase'; // make sure your firebase.js exports 'auth'

export default function Onboarding3({ navigation }) {
  const handleGetStarted = () => {
    if (auth.currentUser) {
      // If user is already logged in, go to Explore
      navigation.replace('Explore');
    } else {
      // If not logged in, go to Sign In
      navigation.replace('SignIn');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/01-OnboardingPage/Onboarding3.png')}
        style={styles.image}
      />
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.text}>
        Share your reviews to help others find the best hotels.
      </Text>

      <TouchableOpacity onPress={handleGetStarted} style={styles.button}>
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 250,
    marginBottom: 30,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
