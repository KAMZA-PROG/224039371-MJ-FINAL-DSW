import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert, TouchableOpacity, Modal } from 'react-native';
import { auth, db, updateProfile } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setNewName(currentUser.displayName || '');
      fetchBookings(currentUser.uid);
    }
  }, []);

  const fetchBookings = async (uid) => {
    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', uid));
      const querySnapshot = await getDocs(q);
      const userBookings = [];
      querySnapshot.forEach((doc) => {
        userBookings.push({ id: doc.id, ...doc.data() });
      });
      setBookings(userBookings);
    } catch (error) {
      console.log('Error fetching bookings:', error.message);
    }
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => navigation.replace('SignIn'))
      .catch((error) => Alert.alert('Error', error.message));
  };

  const handleUpdateProfile = () => {
    if (!newName) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    updateProfile(auth.currentUser, { displayName: newName })
      .then(() => {
        setUser({ ...user, displayName: newName });
        setModalVisible(false);
        Alert.alert('Success', 'Profile updated');
      })
      .catch((error) => Alert.alert('Error', error.message));
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <Text style={styles.bookingHotel}>{item.hotelName}</Text>
      <Text>Check-in: {item.checkIn.toDate ? item.checkIn.toDate().toDateString() : item.checkIn}</Text>
      <Text>Check-out: {item.checkOut.toDate ? item.checkOut.toDate().toDateString() : item.checkOut}</Text>
      <Text>Total: ${item.totalCost || '-'}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading user...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>Name: {user.displayName || 'No Name'}</Text>
      <Text style={styles.label}>Email: {user.email}</Text>

      <TouchableOpacity style={styles.editButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { marginTop: 20 }]}>My Bookings</Text>
      {bookings.length === 0 ? (
        <Text>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Button title="Logout" color="red" onPress={handleLogout} />

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new name"
              value={newName}
              onChangeText={setNewName}
            />
            <Button title="Save" onPress={handleUpdateProfile} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  label: { fontSize: 18, marginBottom: 5 },
  editButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  editButtonText: { color: '#fff', fontWeight: 'bold' },
  bookingCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  bookingHotel: { fontWeight: 'bold', fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default Profile;
