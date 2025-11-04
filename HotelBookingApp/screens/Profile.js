import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Alert, TouchableOpacity, Modal, Image, ScrollView } from 'react-native';
import { auth, db } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const Profile = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [activeTab, setActiveTab] = useState('bookings');

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
      const q = query(
        collection(db, 'bookings'), 
        where('userId', '==', uid),
        orderBy('createdAt', 'desc')
      );
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
    Alert.alert(
      '👋 Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            auth.signOut()
              .then(() => navigation.replace('SignIn'))
              .catch((error) => Alert.alert('❌ Error', error.message));
          }
        }
      ]
    );
  };

  const handleUpdateProfile = () => {
    if (!newName.trim()) {
      Alert.alert('❌ Error', 'Name cannot be empty');
      return;
    }

    updateProfile(auth.currentUser, { displayName: newName.trim() })
      .then(() => {
        setUser({ ...user, displayName: newName.trim() });
        setModalVisible(false);
        Alert.alert('✅ Success', 'Profile updated successfully!');
      })
      .catch((error) => Alert.alert('❌ Error', error.message));
  };

  const formatDate = (timestamp) => {
    if (timestamp && timestamp.toDate) {
      return timestamp.toDate().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return 'Invalid date';
  };

  const getBookingStatus = (checkIn) => {
    const now = new Date();
    const checkInDate = checkIn.toDate ? checkIn.toDate() : new Date(checkIn);
    if (checkInDate > now) return { status: 'Upcoming', color: '#3182CE' };
    return { status: 'Completed', color: '#38A169' };
  };

  const renderBooking = ({ item }) => {
    const status = getBookingStatus(item.checkIn);
    
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <Text style={styles.bookingHotel}>{item.hotelName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={styles.statusText}>{status.status}</Text>
          </View>
        </View>
        
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={16} color="#718096" />
            <Text style={styles.detailText}>{item.hotelLocation || 'Unknown Location'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#718096" />
            <Text style={styles.detailText}>
              {formatDate(item.checkIn)} - {formatDate(item.checkOut)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="bed-outline" size={16} color="#718096" />
            <Text style={styles.detailText}>{item.rooms} room{item.rooms > 1 ? 's' : ''}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#718096" />
            <Text style={styles.detailText}>${item.totalCost || '0'}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading user profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color="#667EEA" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user.displayName || 'Guest User'}
          </Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editIcon}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="create-outline" size={20} color="#667EEA" />
        </TouchableOpacity>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#667EEA" />
          <Text style={styles.statNumber}>{bookings.length}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        
        <View style={styles.statCard}>
          <Ionicons name="star" size={24} color="#FFD700" />
          <Text style={styles.statNumber}>4.8</Text>
          <Text style={styles.statLabel}>Member Since</Text>
          <Text style={styles.memberSince}>2024</Text>
        </View>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons 
            name="bookmark" 
            size={20} 
            color={activeTab === 'bookings' ? '#667EEA' : '#718096'} 
          />
          <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
            My Bookings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.activeTab]}
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name="settings" 
            size={20} 
            color={activeTab === 'settings' ? '#667EEA' : '#718096'} 
          />
          <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
      {activeTab === 'bookings' ? (
        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>📚 My Bookings</Text>
          {bookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bookmark-outline" size={60} color="#CBD5E0" />
              <Text style={styles.emptyStateTitle}>No bookings yet</Text>
              <Text style={styles.emptyStateText}>
                Start exploring amazing hotels and make your first booking!
              </Text>
              <TouchableOpacity 
                style={styles.exploreButton}
                onPress={() => navigation.navigate('Explore')}
              >
                <Text style={styles.exploreButtonText}>Explore Hotels</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={bookings}
              keyExtractor={(item) => item.id}
              renderItem={renderBooking}
              scrollEnabled={false}
              contentContainerStyle={styles.bookingsList}
            />
          )}
        </View>
      ) : (
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Account Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="notifications-outline" size={24} color="#4A5568" />
            <Text style={styles.settingText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="lock-closed-outline" size={24} color="#4A5568" />
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <Ionicons name="help-circle-outline" size={24} color="#4A5568" />
            <Text style={styles.settingText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Edit Profile</Text>
            <Text style={styles.modalSubtitle}>Update your display name</Text>
            
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#667EEA" />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={newName}
                onChangeText={setNewName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleUpdateProfile}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFF',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#718096',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#718096',
  },
  editIcon: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  memberSince: {
    fontSize: 10,
    color: '#CBD5E0',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#667EEA',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  bookingsSection: {
    flex: 1,
  },
  settingsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  exploreButton: {
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bookingsList: {
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingHotel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bookingDetails: {
    // Details container
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E53E3E',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#E53E3E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4A5568',
    fontWeight: 'bold',
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#667EEA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Profile;