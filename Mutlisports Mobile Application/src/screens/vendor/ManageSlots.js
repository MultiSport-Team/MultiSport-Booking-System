import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import bookingService from '../../services/bookingService';

const ManageSlots = ({ navigation, route }) => {
  const { venueId, venueName } = route.params;
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState([{ start_time: '10:00', end_time: '11:00' }]);

  useFocusEffect(
    React.useCallback(() => {
      loadSlots();
    }, [])
  );

  const loadSlots = async () => {
    setLoading(true);
    try {
      const result = await bookingService.getVendorSlots({
        venue_id: venueId,
      });
      if (result.success) {
        setSlots(result.data || []);
      } else {
        Alert.alert('Error', result.message || 'Failed to load slots');
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      Alert.alert('Error', 'Failed to load slots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSlots();
  };

  const handleAddTimeSlot = () => {
    setTimeSlots([...timeSlots, { start_time: '12:00', end_time: '13:00' }]);
  };

  const handleRemoveTimeSlot = (index) => {
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index, field, value) => {
    const updated = [...timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setTimeSlots(updated);
  };

  const handleCreateSlots = async () => {
    if (timeSlots.length === 0) {
      Alert.alert('Error', 'Please add at least one time slot');
      return;
    }

    try {
      const result = await bookingService.createSlots({
        venue_id: venueId,
        date: selectedDate,
        time_slots: timeSlots,
      });

      if (result.success) {
        Alert.alert('Success', result.data.message || 'Slots created successfully');
        setShowAddModal(false);
        setTimeSlots([{ start_time: '10:00', end_time: '11:00' }]);
        loadSlots();
      } else {
        Alert.alert('Error', result.message || 'Failed to create slots');
      }
    } catch (error) {
      console.error('Error creating slots:', error);
      Alert.alert('Error', 'Failed to create slots');
    }
  };

  const handleDeleteSlot = (slotId) => {
    Alert.alert('Delete Slot', 'Are you sure you want to delete this slot?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            const result = await bookingService.deleteSlot(slotId);
            if (result.success) {
              Alert.alert('Success', 'Slot deleted successfully');
              loadSlots();
            } else {
              Alert.alert('Error', result.message || 'Failed to delete slot');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to delete slot');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const getSlotStatus = (slot) => {
    return slot.is_available ? 'AVAILABLE' : 'BOOKED';
  };

  const renderSlotCard = ({ item }) => (
    <View style={styles.slotCard}>
      <View style={styles.slotInfo}>
        <View style={styles.slotDatetime}>
          <Ionicons name="calendar" size={16} color="#FF6B6B" />
          <Text style={styles.slotDate}>{item.date}</Text>
          <Ionicons name="time" size={16} color="#FF6B6B" style={{ marginLeft: 12 }} />
          <Text style={styles.slotTime}>
            {item.start_time} - {item.end_time}
          </Text>
        </View>
        <View style={styles.slotDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Price:</Text>
            <Text style={styles.value}>₹{item.final_price}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.label}>Status:</Text>
            <View style={[styles.statusBadge, item.is_available ? styles.statusAvailable : styles.statusBooked]}>
              <Text style={styles.statusText}>{getSlotStatus(item)}</Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => handleDeleteSlot(item.id)}
      >
        <Ionicons name="trash" size={20} color="#FF6B6B" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading slots...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace('VendorDashboard');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Manage Slots</Text>
          <Text style={styles.headerSubtitle}>{venueName}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {slots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time" size={64} color="#DDD" />
          <Text style={styles.emptyText}>No slots created yet</Text>
          <TouchableOpacity
            style={styles.emptyBtn}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.emptyBtnText}>Create Your First Slot</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={slots}
          renderItem={renderSlotCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* Add Slots Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Slots</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>

            {/* Date Input */}
            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedDate}
                  onChangeText={setSelectedDate}
                />
              </View>

              {/* Time Slots */}
              <View style={styles.formGroup}>
                <View style={styles.timeSlotHeader}>
                  <Text style={styles.label}>Time Slots</Text>
                  <TouchableOpacity onPress={handleAddTimeSlot}>
                    <Ionicons name="add-circle" size={24} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>

                {timeSlots.map((slot, index) => (
                  <View key={index} style={styles.timeSlotRow}>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="Start (HH:MM)"
                      value={slot.start_time}
                      onChangeText={(text) => updateTimeSlot(index, 'start_time', text)}
                    />
                    <Text style={styles.separator}>-</Text>
                    <TextInput
                      style={styles.timeInput}
                      placeholder="End (HH:MM)"
                      value={slot.end_time}
                      onChangeText={(text) => updateTimeSlot(index, 'end_time', text)}
                    />
                    {timeSlots.length > 1 && (
                      <TouchableOpacity
                        onPress={() => handleRemoveTimeSlot(index)}
                        style={styles.removeBtn}
                      >
                        <Ionicons name="trash" size={18} color="#FF6B6B" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>

              {/* Action Buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleCreateSlots}
                >
                  <Text style={styles.submitBtnText}>Create Slots</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: '#FF6B6B',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
  emptyBtn: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  emptyBtnText: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  slotCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  slotInfo: {
    flex: 1,
  },
  slotDatetime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  slotDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: '#D4EDDA',
  },
  statusBooked: {
    backgroundColor: '#F8D7DA',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
  },
  deleteBtn: {
    padding: 8,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  modalBody: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  timeSlotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  separator: {
    fontSize: 16,
    color: '#999',
  },
  removeBtn: {
    padding: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default ManageSlots;
