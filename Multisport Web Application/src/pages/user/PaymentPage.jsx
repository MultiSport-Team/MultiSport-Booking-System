import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import bookingService from '../../services/bookingService';
import couponService from '../../services/couponService';
import invoiceGenerator from '../../utils/invoiceGenerator';
import './PaymentPage.css';

const PaymentPage = () => {
  // Debug: Check html2pdf availability
  useEffect(() => {
    console.log('[PaymentPage] html2pdf available:', !!window.html2pdf);
    if (!window.html2pdf) {
      console.warn('[PaymentPage] ⚠️ html2pdf library NOT found in window object');
    }
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId: bookingIdFromParams } = useParams();
  
  // Get data from location.state or use URL params as fallback
  const locationState = location.state || {};
  const bookingIdFromState = locationState.bookingId;
  const bookingId = bookingIdFromState || bookingIdFromParams;

  const [bookingData, setBookingData] = useState({
    bookingId: bookingIdFromState || bookingIdFromParams || null,
    bookingNumber: locationState.bookingNumber || '',
    amount: locationState.amount || 0,
    venueName: locationState.venueName || '',
    slotTime: locationState.slotTime || '',
    date: locationState.date || '',
    userEmail: locationState.userEmail || '',
  });

  console.log('[PaymentPage] Initial state:', {
    bookingIdFromState,
    bookingIdFromParams,
    bookingId,
    locationStateData: locationState,
  });

  const [loading, setLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  // Only fetch if we don't have all the data from location.state
  const needsDetailsFetch = !bookingIdFromState && bookingIdFromParams;
  const [fetchingDetails, setFetchingDetails] = useState(needsDetailsFetch);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(locationState.amount || 0);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Fetch booking details on mount if not in location state (direct URL or page refresh)
  useEffect(() => {
    if (needsDetailsFetch && bookingIdFromParams) {
      const fetchBookingDetails = async () => {
        try {
          console.log(`[PaymentPage] Fetching booking details for ID: ${bookingIdFromParams}`);
          setFetchingDetails(true);
          const result = await bookingService.getBookingDetails(bookingIdFromParams);
          console.log('[PaymentPage] API Response:', result);
          
          if (result.success && result.data) {
            const booking = result.data;
            console.log('[PaymentPage] Booking data received:', booking);
            // Backend returns flattened data with aliases like venue_name, start_time, end_time, slot_date
            const updatedData = {
              bookingId: booking.id,
              bookingNumber: booking.booking_number,
              amount: booking.amount,
              venueName: booking.venue_name || booking.venue?.name || '',
              slotTime: booking.start_time && booking.end_time ? `${booking.start_time} - ${booking.end_time}` : '',
              date: booking.slot_date || booking.booking_date || '',
              userEmail: booking.user_email || booking.user?.email || sessionStorage.getItem('userEmail') || '',
            };
            console.log('[PaymentPage] Setting booking data:', updatedData);
            setBookingData(updatedData);
            setFinalAmount(booking.amount);
          } else {
            console.error('[PaymentPage] API failed:', result.message);
            toast.error('Failed to fetch booking details');
            setTimeout(() => navigate('/home'), 1500);
          }
        } catch (error) {
          console.error('[PaymentPage] Error fetching booking details:', error);
          toast.error('Failed to load booking information');
          setTimeout(() => navigate('/home'), 1500);
        } finally {
          setFetchingDetails(false);
        }
      };
      fetchBookingDetails();
    } else if (bookingIdFromState) {
      // Data came from location.state, no need to fetch
      console.log('[PaymentPage] Using data from location.state');
      setFetchingDetails(false);
    }
  }, [bookingIdFromParams, bookingIdFromState, needsDetailsFetch, navigate]);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Visa, Mastercard, American Express',
    },
    {
      id: 'upi',
      name: 'UPI',
      icon: '📱',
      description: 'Google Pay, PhonePe, Paytm',
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      icon: '👛',
      description: 'PayPal, Apple Pay',
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      icon: '🏦',
      description: 'Direct bank transfer',
    },
  ];

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      // TODO: Replace with actual coupon validation API call
      // For now, hardcoded "sunbeam" coupon for 100% discount
      if (couponCode.toLowerCase() === 'sunbeam') {
        setDiscountAmount(bookingData.amount);
        setFinalAmount(0);
        setCouponApplied(true);
        toast.success('Coupon applied! You get 100% discount');
      } else {
        toast.error('Invalid coupon code');
      }
    } catch (error) {
      toast.error('Failed to apply coupon');
      console.error(error);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponApplied(false);
    setDiscountAmount(0);
    setFinalAmount(bookingData.amount);
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      // Use the URL param bookingId if available, otherwise use from bookingData
      const idToUse = bookingIdFromParams || bookingData.bookingId;

      if (!idToUse) {
        console.error('[PaymentPage] No booking ID found');
        toast.error('Booking ID not found');
        setLoading(false);
        return;
      }

      console.log(`[PaymentPage] Submitting payment for booking ID: ${idToUse}, Method: ${selectedPaymentMethod}, Final Amount: ₹${finalAmount}`);

      // Call API to confirm payment - use 'PAID' status which backend converts to booking status 'CONFIRMED'
      const paymentPayload = {
        payment_status: 'PAID',
        payment_method: selectedPaymentMethod,
      };
      
      if (couponApplied && couponCode) {
        paymentPayload.coupon_code = couponCode;
      }

      console.log('[PaymentPage] Payment payload:', paymentPayload);
      
      const result = await bookingService.updatePaymentStatus(idToUse, paymentPayload);
      
      console.log('[PaymentPage] Payment API Response:', result);

      if (result.success) {
        toast.success('Payment confirmed successfully!');
        
        // Generate invoice after successful payment
        await generateAndDownloadInvoice();
        
        // Redirect to my-bookings after a short delay to allow invoice download
        setTimeout(() => {
          navigate('/my-bookings');
        }, 2000);
      } else {
        console.error('[PaymentPage] Payment failed:', result.message);
        toast.error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('[PaymentPage] Payment processing error:', error);
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  const generateAndDownloadInvoice = async () => {
    try {
      const invoiceData = {
        bookingNumber: bookingData.bookingNumber,
        venueName: bookingData.venueName,
        date: bookingData.date,
        slotTime: bookingData.slotTime,
        amount: bookingData.amount,
        userEmail: bookingData.userEmail,
        discount: discountAmount,
        couponCode: couponCode,
      };
      
      const result = await invoiceGenerator.generateInvoice(invoiceData);
      if (result.success) {
        console.log('[PaymentPage] Invoice generated successfully');
      }
    } catch (error) {
      console.error('[PaymentPage] Error generating invoice:', error);
      // Don't show error toast here as payment was successful
    }
  };

  const downloadInvoicePreview = async () => {
    try {
      const invoiceData = {
        bookingNumber: bookingData.bookingNumber,
        venueName: bookingData.venueName,
        date: bookingData.date,
        slotTime: bookingData.slotTime,
        amount: bookingData.amount,
        userEmail: bookingData.userEmail,
        discount: discountAmount,
        couponCode: couponCode,
      };
      
      console.log('[PaymentPage] Downloading invoice with data:', invoiceData);
      const result = await invoiceGenerator.generateInvoice(invoiceData);
      console.log('[PaymentPage] Invoice generation result:', result);
      
      if (result.success) {
        toast.success('Invoice downloaded successfully!');
      } else {
        const errorMsg = result.message || 'Failed to download invoice';
        console.error('[PaymentPage] Invoice error:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('[PaymentPage] Error downloading invoice:', error);
      toast.error('Failed to generate invoice: ' + (error.message || 'Unknown error'));
    }
  };

  if (fetchingDetails) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading payment details...</p>
      </div>
    );
  }

  // If we have bookingId but no data, something went wrong
  if (!bookingId) {
    console.warn('[PaymentPage] No booking ID available');
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning" role="alert">
          <h4>No Booking Information</h4>
          <p>Unable to find booking details. Please go back and try again.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/home')}>
          Go Back to Home
        </button>
      </div>
    );
  }

  // Debug: Log what data we're trying to display
  console.log('[PaymentPage] Rendering with data:', {
    bookingId,
    bookingNumber: bookingData.bookingNumber,
    amount: bookingData.amount,
    venueName: bookingData.venueName,
    slotTime: bookingData.slotTime,
    date: bookingData.date,
  });

  return (
    <div className="payment-page">
      <div className="container py-5">
        <div className="row justify-content-center">
          {/* Booking Summary */}
          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Booking Summary</h4>
              </div>
              <div className="card-body">
                <div className="booking-summary">
                  <div className="summary-row">
                    <span className="summary-label">Booking Number:</span>
                    <span className="summary-value">{bookingData.bookingNumber}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Venue:</span>
                    <span className="summary-value">{bookingData.venueName}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Date:</span>
                    <span className="summary-value">{bookingData.date}</span>
                  </div>
                  <div className="summary-row">
                    <span className="summary-label">Time Slot:</span>
                    <span className="summary-value">{bookingData.slotTime}</span>
                  </div>
                  <hr />
                  <div className="summary-row total">
                    <span className="summary-label">Booking Amount:</span>
                    <span className="summary-value">₹{bookingData.amount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">Select Payment Method</h5>
              </div>
              <div className="card-body">
                <div className="payment-methods">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="payment-method-option mb-3">
                      <input
                        type="radio"
                        id={method.id}
                        name="paymentMethod"
                        value={method.id}
                        checked={selectedPaymentMethod === method.id}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="form-check-input"
                      />
                      <label htmlFor={method.id} className="payment-method-label">
                        <span className="payment-icon">{method.icon}</span>
                        <div className="payment-method-details">
                          <div className="payment-method-name">{method.name}</div>
                          <div className="payment-method-description">{method.description}</div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-warning text-dark">
                <h5 className="mb-0">Apply Coupon Code</h5>
              </div>
              <div className="card-body">
                {!couponApplied ? (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className="form-control coupon-input"
                      placeholder="Enter coupon code (e.g., sunbeam)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={validatingCoupon}
                    />
                    <button
                      className="btn btn-outline-warning coupon-btn"
                      onClick={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                    >
                      {validatingCoupon ? 'Validating...' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="coupon-applied-container">
                    <div className="coupon-success">
                      <span className="coupon-status">✓ Coupon Applied</span>
                      <span className="coupon-code">{couponCode}</span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleRemoveCoupon}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="card shadow-sm mb-4 price-breakdown">
              <div className="card-body">
                <div className="breakdown-row">
                  <span>Booking Amount:</span>
                  <span className="amount">₹{bookingData.amount}</span>
                </div>
                {couponApplied && (
                  <>
                    <div className="breakdown-row discount">
                      <span>Discount ({couponCode}):</span>
                      <span className="amount discount-amount">-₹{discountAmount}</span>
                    </div>
                    <hr className="my-2" />
                  </>
                )}
                <div className="breakdown-row final-amount">
                  <span className="fw-bold">Total Amount:</span>
                  <span className="amount fw-bold">₹{finalAmount}</span>
                </div>
              </div>
            </div>

            {/* Invoice Preview Button */}
            <div className="card shadow-sm mb-4 invoice-preview-card">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">📄 Invoice Preview</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-3">Preview and download your invoice before making payment</p>
                <button
                  className="btn btn-outline-info w-100 mb-2"
                  onClick={() => setShowInvoice(!showInvoice)}
                >
                  {showInvoice ? '▼ Hide Invoice' : '▶ View Invoice'}
                </button>
                <button
                  className="btn btn-info w-100"
                  onClick={downloadInvoicePreview}
                >
                  📥 Download Invoice PDF
                </button>
              </div>
            </div>

            {/* Invoice Display */}
            {showInvoice && (
              <div className="card shadow-sm mb-4 invoice-display">
                <div className="card-body">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: invoiceGenerator.generateInvoiceHTML({
                        bookingNumber: bookingData.bookingNumber,
                        venueName: bookingData.venueName,
                        date: bookingData.date,
                        slotTime: bookingData.slotTime,
                        amount: bookingData.amount,
                        userEmail: bookingData.userEmail,
                        discount: discountAmount,
                        couponCode: couponCode,
                      }),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Payment Buttons */}
            <div className="d-grid gap-2">
              <button
                className="btn btn-primary btn-lg mb-2"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? 'Processing Payment...' : `Proceed Payment - ₹${finalAmount}`}
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate('/home')}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
