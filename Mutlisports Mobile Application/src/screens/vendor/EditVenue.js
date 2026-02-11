import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import venueService from '../../services/venueService';

const EditVenue = ({ navigation, route }) => {
  const { venue } = route.params;

  const [formData, setFormData] = useState({
    sport_category_id: venue?.sport_category_id || null,
    name: venue?.name || '',
    city: venue?.city || '',
    address: venue?.address || '',
    description: venue?.description || '',
    price_per_hour: venue?.price_per_hour?.toString() || '',
    amenities: venue?.amenities || {
      parking: false,
      wifi: false,
      locker_rooms: false,
      water: true,
    },
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await venueService.getSportsCategories();
      if (result.success) {
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formData.sport_category_id) {
      newErrors.sport_category_id = 'Please select a sports category';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.price_per_hour.trim()) {
      newErrors.price_per_hour = 'Price per hour is required';
    } else if (isNaN(parseFloat(formData.price_per_hour))) {
      newErrors.price_per_hour = 'Price must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const toggleAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: {
        ...formData.amenities,
        [amenity]: !formData.amenities[amenity],
      },
    });
  };

  const handleUpdateVenue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const venueData = {
        sport_category_id: formData.sport_category_id,
        name: formData.name,
        city: formData.city,
        address: formData.address,
        description: formData.description,
        price_per_hour: parseFloat(formData.price_per_hour),
        amenities: formData.amenities,
      };

      const result = await venueService.updateVenue(venue.id, venueData);

      if (result.success) {
        Alert.alert('Success', 'Venue updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update venue');
      }
    } catch (error) {
      console.error('Error updating venue:', error);
      Alert.alert('Error', 'Failed to update venue');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.sport_category_id
  );

  const renderCategoryOption = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryOption}
      onPress={() => {
        handleInputChange('sport_category_id', item.id);
        setShowCategoryModal(false);
      }}
    >
      <Text style={styles.categoryOptionText}>{item.name}</Text>
      {item.id === formData.sport_category_id && (
        <Ionicons name="checkmark" size={20} color="#FF6B6B" />
      )}
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Venue</Text>
          <View style={styles.placeholder} />
        </View>

        {categoryLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
          </View>
        ) : (
          <View style={styles.formContainer}>
            {/* Sports Category */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Sports Category *</Text>
              <TouchableOpacity
                style={[styles.inputBox, errors.sport_category_id && styles.inputError]}
                onPress={() => setShowCategoryModal(true)}
              >
                <Ionicons name="sports-outline" size={20} color="#666" style={styles.icon} />
                <Text
                  style={[
                    styles.input,
                    { color: selectedCategory ? '#1A1A1A' : '#999' },
                  ]}
                >
                  {selectedCategory ? selectedCategory.name : 'Select a sport'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.sport_category_id && (
                <Text style={styles.errorText}>{errors.sport_category_id}</Text>
              )}
            </View>

            {/* Venue Name */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Venue Name *</Text>
              <View style={[styles.inputBox, errors.name && styles.inputError]}>
                <Ionicons name="storefront" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter venue name"
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  editable={!loading}
                />
              </View>
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </View>

            {/* City */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>City *</Text>
              <View style={[styles.inputBox, errors.city && styles.inputError]}>
                <Ionicons name="map" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter city"
                  value={formData.city}
                  onChangeText={(text) => handleInputChange('city', text)}
                  editable={!loading}
                />
              </View>
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            {/* Address */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Full Address *</Text>
              <View style={[styles.inputBox, errors.address && styles.inputError]}>
                <Ionicons name="location" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter full address"
                  value={formData.address}
                  onChangeText={(text) => handleInputChange('address', text)}
                  editable={!loading}
                  multiline
                  numberOfLines={3}
                />
              </View>
              {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
            </View>

            {/* Price Per Hour */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Price Per Hour (₹) *</Text>
              <View style={[styles.inputBox, errors.price_per_hour && styles.inputError]}>
                <Ionicons name="cash" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter price per hour"
                  value={formData.price_per_hour}
                  onChangeText={(text) => handleInputChange('price_per_hour', text)}
                  editable={!loading}
                  keyboardType="decimal-pad"
                />
              </View>
              {errors.price_per_hour && (
                <Text style={styles.errorText}>{errors.price_per_hour}</Text>
              )}
            </View>

            {/* Description */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Description</Text>
              <View style={[styles.inputBox, errors.description && styles.inputError]}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter venue description"
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  editable={!loading}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Amenities */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Amenities</Text>
              <View style={styles.amenitiesContainer}>
                {Object.keys(formData.amenities).map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityBox,
                      formData.amenities[amenity] && styles.amenityBoxActive,
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    {formData.amenities[amenity] && (
                      <Ionicons name="checkmark" size={16} color="#FF6B6B" />
                    )}
                    <Text
                      style={[
                        styles.amenityLabel,
                        formData.amenities[amenity] && styles.amenityLabelActive,
                      ]}
                    >
                      {amenity.charAt(0).toUpperCase() + amenity.slice(1).replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleUpdateVenue}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitBtnText}>Update Venue</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={24} color="#1A1A1A" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategoryOption}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  formContainer: {
    padding: 16,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1A1A1A',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amenityBoxActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF6B6B',
  },
  amenityLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  amenityLabelActive: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
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
    maxHeight: '70%',
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
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
});

export default EditVenue;
