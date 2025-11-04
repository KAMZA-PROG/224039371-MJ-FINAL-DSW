import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Modal, Button } from 'react-native';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';

const HotelDetails = ({ route, navigation }) => {
  const { hotel } = route.params;
  const [reviews, setReviews] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState('');

  const user = auth.currentUser;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('hotelId', '==', hotel.id),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const fetchedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(fetchedReviews);
    } catch (error) {
      console.log('Error fetching reviews:', error.message);
    }
  };

  const handleAddReview = async () => {
    if (!user) {
      Alert.alert('Authentication Required', 'Please sign in to add a review');
      navigation.navigate('SignIn');
      return;
    }

    if (!newComment || !newRating) {
      Alert.alert('Error', 'Please enter both rating and comment');
      return;
    }

    try {
      const reviewData = {
        hotelId: hotel.id,
        userId: user.uid,
        name: user.displayName || 'You',
        rating: parseFloat(newRating),
        comment: newComment,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setReviews([{ id: docRef.id, ...reviewData }, ...reviews]);
      setModalVisible(false);
      setNewComment('');
      setNewRating('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add review');
      console.log(error.message);
    }
  };

  const renderReview = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.reviewName}>{item.name}  {item.rating}</Text>
      <Text>{item.comment}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Image source={hotel.image} style={styles.image} />
      <Text style={styles.name}>{hotel.name}</Text>
      <Text style={styles.location}>{hotel.location}</Text>
      <Text style={styles.price}>${hotel.price} / night</Text>
      <Text style={styles.rating}>{hotel.rating}</Text>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => {
          if (!user) {
            Alert.alert('Authentication Required', 'Please sign in to book');
            navigation.navigate('SignIn');
          } else {
            navigation.navigate('Booking', { hotel });
          }
        }}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Reviews</Text>
      {reviews.length === 0 ? (
        <Text>No reviews yet. Be the first to add one!</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={renderReview}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={() => {
          if (!user) {
            Alert.alert('Authentication Required', 'Please sign in to add a review');
            navigation.navigate('SignIn');
          } else {
            setModalVisible(true);
          }
        }}
      >
        <Text style={styles.addReviewText}>Add Review</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Review</Text>
            <TextInput
              placeholder="Rating (1-5)"
              keyboardType="numeric"
              style={styles.input}
              value={newRating}
              onChangeText={setNewRating}
            />
            <TextInput
              placeholder="Your comment"
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
            />
            <Button title="Submit" onPress={handleAddReview} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 10 },
  image: { width: '100%', height: 200, borderRadius: 10, marginBottom: 10 },
  name: { fontSize: 24, fontWeight: 'bold' },
  location: { fontSize: 16, color: '#555', marginBottom: 5 },
  price: { fontSize: 18, fontWeight: 'bold', color: '#007BFF', marginBottom: 5 },
  rating: { fontSize: 16, marginBottom: 10 },
  bookButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
  bookButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  reviewCard: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  reviewName: { fontWeight: 'bold' },
  addReviewButton: { backgroundColor: '#007BFF', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  addReviewText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#aaa', borderRadius: 5, padding: 10, marginBottom: 10 },
});

export default HotelDetails;
