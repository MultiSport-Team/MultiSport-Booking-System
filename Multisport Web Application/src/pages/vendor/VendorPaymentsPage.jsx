import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import financeService from '../../services/financeService';

const VendorPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const result = await financeService.getVendorBookings();
      if (result.success) {
        const bookings = result.data || [];
        setPayments(bookings);
        const totalAmount = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        setTotal(totalAmount);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load payments');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5"><div className="spinner-border"></div></div>;
  }

  return (
    <div className="container py-5">
      <h2>Payment Summary</h2>
      <div className="card mb-4 mt-4">
        <div className="card-body">
          <h5>Total Earnings: <span className="text-success">₹{total}</span></h5>
        </div>
      </div>

      {payments.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Booking #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td>{payment.booking_number}</td>
                <td>{payment.booking_date}</td>
                <td>₹{payment.total_amount}</td>
                <td>{payment.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted mt-4">No payments yet</p>
      )}
    </div>
  );
};

export default VendorPaymentsPage;
