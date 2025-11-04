import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const sampleHotels = [
  {
    id: '1',
    name: 'Sunrise Hotel',
    location: 'Cape Town',
    price: 120,
    rating: 4.5,
    image: require('../assets/06-ExplorePage/image-1.png'),
  },
  {
    id: '2',
    name: 'Ocean View Inn',
    location: 'Durban',
    price: 150,
    rating: 4.7,
    image: require('../assets/06-ExplorePage/image-4.png'),
  },
  {
    id: '3',
    name: 'Mountain Lodge',
    location: 'Johannesburg',
    price: 100,
    rating: 4.2,
    image: require('../assets/06-ExplorePage/image-13.png'),
  },
];

const Explore = ({ navigation }) => {
  const renderHotel = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
    >
      <Image source={item.image} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.rating}>⭐ {item.rating} | ${item.price}/night</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sampleHotels}
        keyExtractor={(item) => item.id}
        renderItem={renderHotel}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    elevation: 2,
  },
  image: { width: width - 20, height: 180 },
  info: { padding: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  location: { fontSize: 14, color: '#666', marginVertical: 3 },
  rating: { fontSize: 14, color: '#333' },
});

export default Explore;
