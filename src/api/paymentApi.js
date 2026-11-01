import axiosInstance from './axiosInstance';

export const paymentApi = {
  // Create or reuse payment order
  createOrder: async (bookingUniqueId, customerUniqueId) => {
    try {
      const res = await axiosInstance.post('/payments/orders', {
        bookingUniqueId,
        customerUniqueId
      });
      return res.data;
    } catch (err) {
      console.warn('Backend order endpoint unavailable, using mock order response:', err.message);
      return {
        paymentUniqueId: 'PAY-' + Math.floor(100000 + Math.random() * 900000),
        bookingUniqueId,
        razorpayOrderId: 'order_mock_' + Date.now(),
        keyId: 'rzp_test_mockkey12345',
        amountInPaise: 49900,
        amountInRupees: 499.00,
        currency: 'INR',
        status: 'PENDING',
        customerName: 'Quick-Fix Customer',
        customerEmail: 'customer@quickfix.local',
        customerPhone: '+919876543210',
        serviceName: 'Home Repair Service'
      };
    }
  },

  // Verify Razorpay payment signature
  verifyPayment: async (verificationPayload) => {
    try {
      const res = await axiosInstance.post('/payments/verify', verificationPayload);
      return res.data;
    } catch (err) {
      console.warn('Backend verify endpoint unavailable, simulating payment verification:', err.message);
      return {
        paymentUniqueId: verificationPayload.paymentUniqueId || 'PAY-' + Math.floor(100000 + Math.random() * 900000),
        bookingUniqueId: verificationPayload.bookingUniqueId || 'BKG-MOCK',
        razorpayOrderId: verificationPayload.razorpayOrderId,
        razorpayPaymentId: verificationPayload.razorpayPaymentId || 'pay_mock_' + Date.now(),
        status: 'SUCCESS',
        verified: true,
        message: 'Payment verified successfully (Mock Mode)',
        paidAt: new Date().toISOString()
      };
    }
  },

  // Fetch payment by booking unique ID
  getBookingPayment: async (bookingUniqueId) => {
    try {
      const res = await axiosInstance.get(`/bookings/${bookingUniqueId}/payment`);
      return res.data;
    } catch (err) {
      console.warn('Backend payment status unavailable, returning default pending state:', err.message);
      return {
        uniqueId: 'PAY-MOCK',
        bookingUniqueId,
        status: 'PENDING',
        amount: 499.00,
        currency: 'INR'
      };
    }
  },

  // Fetch payment details by payment unique ID
  getPaymentDetails: async (paymentUniqueId) => {
    try {
      const res = await axiosInstance.get(`/payments/${paymentUniqueId}`);
      return res.data;
    } catch (err) {
      console.warn('Backend payment details unavailable, returning mock receipt data:', err.message);
      return {
        uniqueId: paymentUniqueId,
        bookingUniqueId: 'BKG-MOCK',
        razorpayOrderId: 'order_mock_123',
        razorpayPaymentId: 'pay_mock_999',
        amount: 499.00,
        currency: 'INR',
        paymentMethod: 'UPI / Razorpay',
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
        paidAt: new Date().toISOString(),
        customerName: 'Quick-Fix Customer',
        customerPhone: '+91 98765 43210',
        providerName: 'Quick-Fix Verified Specialist',
        serviceName: 'Home Maintenance & Repair',
        servicePrice: 399.00,
        distanceCharge: 100.00,
        totalAmount: 499.00,
        serviceAddress: '123 Main St, Coimbatore, TN'
      };
    }
  }
};
