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
  FlatList,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import adminService from '../../services/adminService';

const AdminCategories = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('');
  const [iconBase64, setIconBase64] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await adminService.getSportsCategories();
      if (result.success) {
        setCategories(result.data);
      } else {
        Alert.alert('Error', 'Failed to load categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const pickCategoryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.cancelled) {
        setCategoryIcon(result.uri);
        setIconBase64(result.base64);
        if (errors.icon) {
          setErrors({ ...errors, icon: null });
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const validateForm = () => {
    let newErrors = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }
    if (!iconBase64) {
      newErrors.icon = 'Category icon is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const iconData = `data:image/jpeg;base64,${iconBase64}`;
      const result = await adminService.addSportsCategory(categoryName, iconData);
      if (result.success) {
        Alert.alert('Success', 'Category added successfully!', [
          {
            text: 'OK',
            onPress: () => {
              setCategoryName('');
              setCategoryIcon('');
              setIconBase64('');
              setErrors({});
              loadCategories();
            },
          },
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add category');
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Failed to add category');
    } finally {
      setSubmitting(false);
    }
  };

  const CategoryCard = ({ category }) => (
    <View style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        {category.icon_url ? (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconPlaceholderText}>📷</Text>
          </View>
        ) : (
          <View style={styles.noIconPlaceholder}>
            <Ionicons name="image-outline" size={32} color="#CCC" />
          </View>
        )}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDate}>
            Added {new Date(category.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#FF6B6B']}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.replace('AdminDashboard');
          }
        }}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sports Categories</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Add New Category Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add New Category</Text>

        {/* Category Name */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Category Name *</Text>
          <View style={[styles.inputBox, errors.categoryName && styles.inputError]}>
            <Ionicons name="sports-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="e.g., Cricket, Football"
              value={categoryName}
              onChangeText={(text) => {
                setCategoryName(text);
                if (errors.categoryName) {
                  setErrors({ ...errors, categoryName: null });
                }
              }}
              editable={!submitting}
            />
          </View>
          {errors.categoryName && (
            <Text style={styles.errorText}>{errors.categoryName}</Text>
          )}
        </View>

        {/* Icon Image */}
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Category Icon *</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickCategoryImage} disabled={submitting}>
            {categoryIcon ? (
              <Image source={{ uri: categoryIcon }} style={styles.imageThumb} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image" size={28} color="#999" />
                <Text style={styles.imagePlaceholderText}>Select Image</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.icon && (
            <Text style={styles.errorText}>{errors.icon}</Text>
          )}
          <Text style={styles.helperText}>
            Select a square image (PNG, JPG, GIF, or SVG)
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleAddCategory}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>Add Category</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Existing Categories */}
      <View style={styles.categoriesSection}>
        <Text style={styles.sectionTitle}>
          Existing Categories ({categories.length})
        </Text>

        {categories.length > 0 ? (
          categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="apps-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>No categories yet</Text>
            <Text style={styles.emptySubtext}>Create one using the form above</Text>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  formSection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
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
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  submitBtn: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
  categoriesSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholderText: {
    fontSize: 28,
  },
  noIconPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  categoryDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  footer: {
    height: 20,
  },

  // Image Picker Styles
  imagePicker: {
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  imageThumb: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 150,
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
});

export default AdminCategories;
