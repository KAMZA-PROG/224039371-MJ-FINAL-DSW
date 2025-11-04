import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const Booking = ({ route, navigation }) => {
  const { hotel } = route.params;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow);
  const [rooms, setRooms] = useState('1');
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCheckOut, setShowCheckOut] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const calculateBookingDetails = () => {
    const days = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const numRooms = parseInt(rooms) || 1;
    const totalCost = days * hotel.price * numRooms;
    
    return { days, numRooms, totalCost };
  };

  const handleConfirmBooking = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('🔐 Authentication Required', 'Please sign in to book a hotel');
      navigation.navigate('SignIn');
      return;
    }
    if (checkOut <= checkIn) {
      Alert.alert('📅 Invalid Dates', 'Check-out date must be after check-in date');
      return;
    }

    const numRooms = parseInt(rooms);
    if (isNaN(numRooms) || numRooms < 1) {
      Alert.alert('🛏️ Invalid Rooms', 'Please enter a valid number of rooms (at least 1)');
      return;
    }

    if (numRooms > 10) {
      Alert.alert('🚫 Too Many Rooms', 'Maximum 10 rooms per booking');
      return;
    }

    const { days, totalCost } = calculateBookingDetails();
    Alert.alert(
      '📋 Confirm Your Booking',
      `🏨 ${hotel.name}\n📍 ${hotel.location}\n\n📅 Check-in: ${formatDate(checkIn)}\n📅 Check-out: ${formatDate(checkOut)}\n🛏️ Rooms: ${numRooms}\n🌙 Total Nights: ${days}\n💰 Total Cost: $${totalCost}`,
      [
        { text: '✏️ Edit', style: 'cancel' },
        { 
          text: '✅ Confirm & Pay', 
          onPress: async () => {
            try {
              await addDoc(collection(db, 'bookings'), {
                userId: user.uid,
                hotelId: hotel.id || 'unknown_hotel',
                hotelName: hotel.name,
                hotelLocation: hotel.location,
                hotelPrice: hotel.price,
                hotelImage: hotel.image,
                checkIn: Timestamp.fromDate(checkIn),
                checkOut: Timestamp.fromDate(checkOut),
                rooms: numRooms,
                totalCost: totalCost.toString(),
                createdAt: Timestamp.now(),
                status: 'confirmed',
                guestName: user.displayName || 'Guest',
                guestEmail: user.email,
              });
              Alert.alert(
                '🎉 Booking Confirmed!',
                `Your stay at ${hotel.name} has been successfully booked!\n\n📧 Confirmation sent to: ${user.email}\n\nWe look forward to hosting you!`,
                [
                  { 
                    text: '📚 My Bookings', 
                    onPress: () => navigation.navigate('Profile') 
                  },
                  { 
                    text: '🏨 Book Another', 
                    onPress: () => navigation.navigate('Explore') 
                  }
                ]
              );
            } catch (error) {
              console.error('Firestore Error:', error);
              Alert.alert(
                '❌ Booking Failed', 
                'There was an error processing your booking. Please try again.'
              );
            }
          }
        }
      ]
    );
  };

  const onCheckInChange = (event, selectedDate) => {
    setShowCheckIn(false);
    if (selectedDate) {
      setCheckIn(selectedDate);
      if (checkOut <= selectedDate) {
        const newCheckOut = new Date(selectedDate);
        newCheckOut.setDate(newCheckOut.getDate() + 1);
        setCheckOut(newCheckOut);
      }
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOut(false);
    if (selectedDate) {
      setCheckOut(selectedDate);
    }
  };

  const { days, numRooms, totalCost } = calculateBookingDetails();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hotelHeader}>
        <Image source={hotel.image} style={styles.image} />
        <View style={styles.hotelInfo}>
          <Text style={styles.name}>{hotel.name}</Text>
          <Text style={styles.location}>📍 {hotel.location}</Text>
          <View style={styles.priceRating}>
            <Text style={styles.price}>${hotel.price}</Text>
            <Text style={styles.nightText}>/night</Text>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{hotel.rating || 4.5}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.bookingForm}>
        <Text style={styles.sectionTitle}>Booking Details</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Check-In Date</Text>
          <TouchableOpacity onPress={() => setShowCheckIn(true)} style={styles.dateButton}>
            <Ionicons name="calendar" size={20} color="#667EEA" />
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formatDate(checkIn)}</Text>
              <Text style={styles.changeText}>Tap to change date</Text>
            </View>
          </TouchableOpacity>
          {showCheckIn && (
            <DateTimePicker
              value={checkIn}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={onCheckInChange}
            />
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📅 Check-Out Date</Text>
          <TouchableOpacity onPress={() => setShowCheckOut(true)} style={styles.dateButton}>
            <Ionicons name="calendar" size={20} color="#667EEA" />
            <View style={styles.dateTextContainer}>
              <Text style={styles.dateText}>{formatDate(checkOut)}</Text>
              <Text style={styles.changeText}>Tap to change date</Text>
            </View>
          </TouchableOpacity>
          {showCheckOut && (
            <DateTimePicker
              value={checkOut}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={checkIn}
              onChange={onCheckOutChange}
            />
          )}
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>🛏️ Number of Rooms</Text>
          <View style={styles.roomsInputContainer}>
            <Ionicons name="bed" size={20} color="#667EEA" />
            <TextInput
              style={styles.input}
              placeholder="Enter number of rooms"
              value={rooms}
              onChangeText={setRooms}
              keyboardType="number-pad"
              maxLength={2}
            />
          </View>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>💰 Booking Summary</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Nightly Rate</Text>
          <Text style={styles.summaryValue}>${hotel.price}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Number of Nights</Text>
          <Text style={styles.summaryValue}>{days}</Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Number of Rooms</Text>
          <Text style={styles.summaryValue}>{numRooms}</Text>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.summaryItem}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalCost}>${totalCost}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.bookButton} onPress={handleConfirmBooking}>
        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        <Text style={styles.bookButtonText}>Confirm Booking</Text>
      </TouchableOpacity>
      <View style={styles.securityNote}>
        <Ionicons name="shield-checkmark" size={16} color="#48BB78" />
        <Text style={styles.securityText}>Your booking is secure and encrypted</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFF',
    padding: 20,
  },
  hotelHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: { 
    width: 100, 
    height: 100, 
    borderRadius: 16,
    marginRight: 16,
  },
  hotelInfo: {
    flex: 1,
  },
  name: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#2D3748',
    marginBottom: 4,
  },
  location: { 
    fontSize: 14, 
    color: '#718096', 
    marginBottom: 8,
    fontWeight: '500',
  },
  priceRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#48BB78',
    marginRight: 4,
  },
  nightText: { 
    fontSize: 14, 
    color: '#718096',
    marginRight: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D69E2E',
    marginLeft: 4,
  },
  bookingForm: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
  },
  dateTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  changeText: {
    fontSize: 12,
    color: '#667EEA',
    marginTop: 2,
  },
  roomsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 12,
  },
  summary: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  totalCost: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#48BB78',
  },
  bookButton: {
    backgroundColor: '#667EEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  securityText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 6,
  },
});

export default Booking;