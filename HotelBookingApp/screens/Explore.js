import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const sampleHotels = [
  {
    id: '1',
    name: 'Sunrise Hotel',
    location: 'Cape Town, Waterfront',
    price: 120,
    rating: 4.5,
    image: require('../assets/06-ExplorePage/image-1.png'),
    description: 'Luxury beachfront experience'
  },
  {
    id: '2',
    name: 'Ocean View Inn',
    location: 'Durban, Beachfront',
    price: 150,
    rating: 4.7,
    image: require('../assets/06-ExplorePage/image-4.png'),
    description: 'Stunning ocean views'
  },
  {
    id: '3',
    name: 'Mountain Lodge',
    location: 'Johannesburg, Sandton',
    price: 100,
    rating: 4.2,
    image: require('../assets/06-ExplorePage/image-13.png'),
    description: 'Peaceful mountain retreat'
  },
  {
    id: '4',
    name: 'City Sky Hotel',
    location: 'Pretoria, CBD',
    price: 130,
    rating: 4.3,
    image: require('../assets/06-ExplorePage/image-1.png'),
    description: 'Modern city center hotel'
  },
];

const Explore = () => {
  const navigation = useNavigation();

  const renderHotel = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
    >
      {/* Hotel Image on Left */}
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} />
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>

      {/* Hotel Details on Right */}
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>📍 {item.location}</Text>
        <Text style={styles.description}>{item.description}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.nightText}>/night</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={() => navigation.navigate('HotelDetails', { hotel: item })}
        >
          <Text style={styles.bookButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Profile Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Hotels</Text>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileText}>👤</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Find your perfect stay</Text>

      <FlatList
        data={sampleHotels}
        keyExtractor={(item) => item.id}
        renderItem={renderHotel}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: '#F8FAFF',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 25,
    fontWeight: '500',
  },
  profileButton: {
    backgroundColor: '#667EEA',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileText: {
    color: '#fff',
    fontSize: 18,
  },
  listContent: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  imageContainer: {
    position: 'relative',
    width: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 6,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: '#A0AEC0',
    marginBottom: 8,
    lineHeight: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#48BB78',
    marginRight: 4,
  },
  nightText: {
    fontSize: 12,
    color: '#718096',
  },
  bookButton: {
    backgroundColor: '#667EEA',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Explore;