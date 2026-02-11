import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../utils/config';
import {
  getVenuesStart,
  getVenuesSuccess,
  getVenuesFailure,
  getVenueStart,
  getVenueSuccess,
  getVenueFailure,
  getCategoriesStart,
  getCategoriesSuccess,
  getCategoriesFailure,
  setFilters,
} from '../store/venueSlice';

export const useVenue = () => {
  const dispatch = useDispatch();
  const { venues, currentVenue, categories, filters, loading, error } = useSelector(
    (state) => state.venue
  );

  const getVenues = useCallback(
    async (filterParams = {}) => {
      dispatch(getVenuesStart());
      try {
        const params = new URLSearchParams();
        if (filterParams.city) params.append('city', filterParams.city);
        if (filterParams.sport_category_id) params.append('sport_category_id', filterParams.sport_category_id);
        if (filterParams.min_price) params.append('min_price', filterParams.min_price);
        if (filterParams.max_price) params.append('max_price', filterParams.max_price);
        if (filterParams.search) params.append('search', filterParams.search);

        const response = await api.get(`${ENDPOINTS.GET_ALL_VENUES}?${params.toString()}`);
        dispatch(getVenuesSuccess(response.data.data || []));
        return { success: true, data: response.data.data };
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch venues';
        dispatch(getVenuesFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const getVenueById = useCallback(
    async (id) => {
      dispatch(getVenueStart());
      try {
        const url = ENDPOINTS.GET_VENUE_BY_ID.replace(':id', id);
        const response = await api.get(url);
        dispatch(getVenueSuccess(response.data.data));
        return { success: true, data: response.data.data };
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch venue details';
        dispatch(getVenueFailure(errorMessage));
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const getCategories = useCallback(async () => {
    dispatch(getCategoriesStart());
    try {
      const response = await api.get(ENDPOINTS.GET_CATEGORIES);
      dispatch(getCategoriesSuccess(response.data.data || []));
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to fetch categories';
      dispatch(getCategoriesFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
  }, [dispatch]);

  const applyFilters = useCallback(
    (newFilters) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  return {
    venues,
    currentVenue,
    categories,
    filters,
    loading,
    error,
    getVenues,
    getVenueById,
    getCategories,
    applyFilters,
  };
};
