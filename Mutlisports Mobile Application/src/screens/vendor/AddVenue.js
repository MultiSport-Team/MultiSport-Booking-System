import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import venueService from '../../services/venueService';

const AddVenue = ({ navigation }) => {
  const [formData, setFormData] = useState({
    sport_category_id: '',
    name: '',
    city: '',
    address: '',
    price_per_hour: '',
    amenities: {
      parking: false,
      wifi: false,
      lighting: false,
      seating: false,
      equipment: false,
      changing_rooms: false,
    },
  });

  const [venueImage, setVenueImage] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const result = await venueService.getCategories();
      if (result.success && result.data) {
        setCategories(result.data);
      } else {
        console.error('Failed to load categories:', result.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([])
    }
  };

  const pickVenueImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.cancelled && !result.canceled && result.uri && result.base64) {
        setVenueImage(result.uri);
        setImageBase64(result.base64);
        if (errors.image) {
          setErrors({ ...errors, image: null });
        }
        } else if (result.cancelled || result.canceled) {
        // User cancelled the image picker - do nothing
      } else {
        // Image picker returned but no valid data
        Alert.alert('Error', 'Failed to process image. Please try again.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please check permissions.');
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // if (!imageBase64) {
    //   newErrors.image = 'Venue image is required';
    // }
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

  const handleAddVenue = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const venueData = {
        sport_category_id: formData.sport_category_id,
        name: formData.name,
        city: formData.city,
        address: formData.address,
        price_per_hour: parseFloat(formData.price_per_hour),
        amenities: formData.amenities,
        // image: `data:image/jpeg;base64,${imageBase64}`,
      };

      // Only include image if it was selected
      if (imageBase64) {
        venueData.image = `data:image/jpeg;base64,${imageBase64}`;
      }

      const result = await venueService.createVenue(venueData);

      if (result.success) {
        Alert.alert('Success', 'Venue added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setFormData({
                sport_category_id: '',
                name: '',
                city: '',
                address: '',
                price_per_hour: '',
                amenities: {
                  parking: false,
                  wifi: false,
                  lighting: false,
                  seating: false,
                  equipment: false,
                  changing_rooms: false,
                },
              });
              setVenueImage('');
              setImageBase64('');
              setErrors({});
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add venue');
      }
    } catch (error) {
      console.error('Error adding venue:', error);
      Alert.alert('Error', 'Failed to add venue');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === formData.sport_category_id);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace('ManageVenues');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Venue</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Sports Category */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Sports Category *</Text>
          <TouchableOpacity
            style={[styles.inputBox, errors.sport_category_id && styles.inputError]}
            onPress={() => setShowCategoryModal(true)}
          >
            <Ionicons name="sports-outline" size={20} color="#666" style={styles.icon} />
            <Text style={selectedCategory ? styles.input : [styles.input, { color: '#999' }]}>
              {selectedCategory ? selectedCategory.name : 'Select a sports category'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
          {errors.sport_category_id && (
            <Text style={styles.errorText}>{errors.sport_category_id}</Text>
          )}
        </View>

        {/* Category Modal */}
        {showCategoryModal && (
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalOverlay}
              onPress={() => setShowCategoryModal(false)}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                  <Ionicons name="close" size={24} color="#1A1A1A" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryOption}
                    onPress={() => {
                      setFormData({ ...formData, sport_category_id: category.id });
                      setShowCategoryModal(false);
                      if (errors.sport_category_id) {
                        setErrors({ ...errors, sport_category_id: null });
                      }
                    }}
                  >
                    <Text style={styles.categoryOptionText}>{category.name}</Text>
                    {formData.sport_category_id === category.id && (
                      <Ionicons name="checkmark-circle" size={20} color="#FF6B6B" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Venue Image */}
        <View style={styles.inputWrapper}>
          {/* <Text style={styles.label}>Venue Image *</Text> */}
          <Text style={styles.label}>Venue Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickVenueImage} disabled={loading}>
            {venueImage ? (
              <Image source={{ uri: venueImage }} style={styles.imageThumb} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image" size={28} color="#999" />
                {/* <Text style={styles.imagePlaceholderText}>Select Image</Text> */}
                <Text style={styles.imagePlaceholderText}>Select Image (Optional)</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
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
            <Ionicons name="location" size={20} color="#666" style={styles.icon} />
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
          <Text style={styles.label}>Address *</Text>
          <View style={[styles.inputBox, styles.textArea, errors.address && styles.inputError]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter full address"
              value={formData.address}
              onChangeText={(text) => handleInputChange('address', text)}
              multiline
              numberOfLines={3}
              editable={!loading}
            />
          </View>
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        {/* Price Per Hour */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Price Per Hour (₹) *</Text>
          <View style={[styles.inputBox, errors.price_per_hour && styles.inputError]}>
            <Ionicons name="pricetag" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Enter price"
              value={formData.price_per_hour}
              onChangeText={(text) => handleInputChange('price_per_hour', text)}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
          {errors.price_per_hour && (
            <Text style={styles.errorText}>{errors.price_per_hour}</Text>
          )}
        </View>

        {/* Amenities */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Amenities</Text>
          <View style={styles.amenitiesContainer}>
            {Object.entries(formData.amenities).map(([amenity, value]) => (
              <TouchableOpacity
                key={amenity}
                style={[styles.amenityBox, value && styles.amenityBoxActive]}
                onPress={() => toggleAmenity(amenity)}
                disabled={loading}
              >
                <Ionicons
                  name={value ? 'checkbox' : 'checkbox-outline'}
                  size={20}
                  color={value ? '#FF6B6B' : '#CCC'}
                />
                <Text style={[styles.amenityLabel, value && styles.amenityLabelActive]}>
                  {amenity.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleAddVenue}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>Add Venue</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 30,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 24,
  },
  form: {
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
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
  modalOverlay: {
    flex: 1,
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
  categoryList: {
    maxHeight: 300,
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

  // Image Picker Styles
  imagePicker: {
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    height: 20,
  },
});

export default AddVenue;
