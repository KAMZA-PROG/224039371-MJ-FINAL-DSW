import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebase'; 
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const Booking = ({ route, navigation }) => {
  const { hotel } = route.params;

  const [checkIn, setCheckIn] = useState(new Date());
  const [checkOut, setCheckOut] = useState(new Date());
  const [rooms, setRooms] = useState('1');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const handleConfirmBooking = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to book');
      navigation.navigate('SignIn');
      return;
    }

    if (checkOut <= checkIn) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    const numRooms = parseInt(rooms);
    if (isNaN(numRooms) || numRooms < 1) {
      Alert.alert('Error', 'Enter a valid number of rooms');
      return;
    }

    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalCost = days * hotel.price * numRooms;

    // Save booking to Firestore
    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        hotelId: hotel.id,
        hotelName: hotel.name,
        checkIn: Timestamp.fromDate(checkIn),
        checkOut: Timestamp.fromDate(checkOut),
        rooms: numRooms,
        totalCost,
        createdAt: Timestamp.now(),
      });

      Alert.alert(
        'Booking Confirmed',
        `Hotel: ${hotel.name}\nCheck-in: ${checkIn.toDateString()}\nCheck-out: ${checkOut.toDateString()}\nRooms: ${numRooms}\nTotal: $${totalCost}`,
        [{ text: 'OK', onPress: () => navigation.navigate('Explore') }]
      );
    } catch (error) {
      console.log('Firestore Error:', error.message);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.location}>{hotel.location}</Text>
      <Text style={styles.price}>${hotel.price} / night</Text>

      <TouchableOpacity onPress={() => setShowCheckIn(true)} style={styles.dateButton}>
        <Text>Check-in: {checkIn.toDateString()}</Text>
      </TouchableOpacity>
      {showCheckIn && (
        <DateTimePicker
          value={checkIn}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowCheckIn(Platform.OS === 'ios');
            if (selectedDate) setCheckIn(selectedDate);
          }}
        />
      )}

      <TouchableOpacity onPress={() => setShowCheckOut(true)} style={styles.dateButton}>
        <Text>Check-out: {checkOut.toDateString()}</Text>
      </TouchableOpacity>
      {showCheckOut && (
        <DateTimePicker
          value={checkOut}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={checkIn}
          onChange={(event, selectedDate) => {
            setShowCheckOut(Platform.OS === 'ios');
            if (selectedDate) setCheckOut(selectedDate);
          }}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Number of rooms"
        value={rooms}
        onChangeText={setRooms}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.bookButton} onPress={handleConfirmBooking}>
        <Text style={styles.bookButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold' },
  location: { fontSize: 16, color: '#555', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', marginBottom: 10 },
  dateButton: { borderWidth: 1, borderColor: '#aaa', padding: 12, borderRadius: 8, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, borderRadius: 5, marginBottom: 15 },
  bookButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default Booking;
