import React, { useState } from 'react';
import { CreditCard, Loader2, Lock, CheckCircle2 } from 'lucide-react';
import { paymentApi } from '../../api/paymentApi';
import { useNotification } from '../../context/NotificationContext';

export default function RazorpayCheckoutButton({ booking, onPaymentSuccess, onPaymentError }) {
  const [loading, setLoading] = useState(false);
  const [showMockModal, setShowMockModal] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const { showToast } = useNotification();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInitiatePayment = async () => {
    setLoading(true);
    try {
      // Step 1: Create backend order
      const order = await paymentApi.createOrder(
        booking.bookingUniqueId || booking.uniqueId,
        booking.customerUniqueId
      );
      setOrderDetails(order);

      // Step 2: Load Razorpay Checkout SDK script
      const scriptLoaded = await loadRazorpayScript();

      // If Razorpay SDK is available and not mock key, trigger real popup
      if (scriptLoaded && window.Razorpay && order.keyId && !order.keyId.includes('mockkey')) {
        const options = {
          key: order.keyId,
          amount: order.amountInPaise,
          currency: order.currency || 'INR',
          name: 'Quick-Fix Local Services',
          description: `Payment for ${order.serviceName || 'Booking'}`,
          order_id: order.razorpayOrderId,
          prefill: {
            name: order.customerName || '',
            email: order.customerEmail || '',
            contact: order.customerPhone || ''
          },
          theme: {
            color: '#059669'
          },
          handler: async (response) => {
            await handleVerifySignature({
              paymentUniqueId: order.paymentUniqueId,
              bookingUniqueId: order.bookingUniqueId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customerUniqueId: booking.customerUniqueId
            });
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              showToast('Payment window closed before completing checkout.', 'warning');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setLoading(false);
          showToast(`Payment Failed: ${response.error.description}`, 'error');
          if (onPaymentError) onPaymentError(response.error);
        });
        rzp.open();
      } else {
        // Fallback to Interactive Razorpay Demo Checkout Modal (for local test mode or mock key)
        setShowMockModal(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      showToast(error.response?.data?.message || 'Failed to initialize payment order.', 'error');
      if (onPaymentError) onPaymentError(error);
    }
  };

  const handleVerifySignature = async (payload) => {
    setLoading(true);
    try {
      const verification = await paymentApi.verifyPayment(payload);
      if (verification.verified || verification.status === 'SUCCESS') {
        showToast('Payment successful & verified server-side!', 'success');
        if (onPaymentSuccess) onPaymentSuccess(verification);
      } else {
        showToast('Payment signature verification failed.', 'error');
        if (onPaymentError) onPaymentError(verification);
      }
    } catch (err) {
      showToast('Error during payment verification.', 'error');
      if (onPaymentError) onPaymentError(err);
    } finally {
      setLoading(false);
      setShowMockModal(false);
    }
  };

  const handleMockPaySuccess = () => {
    if (!orderDetails) return;
    const mockPaymentId = 'pay_mock_' + Math.floor(1000000000 + Math.random() * 9000000000);
    const mockSignature = 'mock_sig_' + Date.now();
    handleVerifySignature({
      paymentUniqueId: orderDetails.paymentUniqueId,
      bookingUniqueId: orderDetails.bookingUniqueId,
      razorpayOrderId: orderDetails.razorpayOrderId,
      razorpayPaymentId: mockPaymentId,
      razorpaySignature: mockSignature,
      customerUniqueId: booking.customerUniqueId
    });
  };

  return (
    <>
      <button
        onClick={handleInitiatePayment}
        disabled={loading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30 transition-all duration-200 flex items-center justify-center gap-3 group border border-emerald-500/20 active:scale-[0.99]"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>Pay ₹{(booking.totalAmount || booking.totalPrice || 0).toFixed(2)} with Razorpay</span>
            <Lock className="w-4 h-4 ml-auto text-emerald-200 opacity-80" />
          </>
        )}
      </button>

      {/* Interactive Razorpay Test Mode Simulation Modal */}
      {showMockModal && orderDetails && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-slate-950 text-white p-5 rounded-2xl mb-5 flex items-center justify-between border border-slate-800">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">Razorpay Gateway Test Mode</span>
                <h3 className="font-extrabold text-base text-white mt-0.5">Quick-Fix Checkout</h3>
              </div>
              <div className="bg-emerald-600 text-white font-black text-sm px-3 py-1.5 rounded-xl shadow-xs">
                ₹{orderDetails.amountInRupees}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Order ID:</span>
                  <span className="font-mono font-bold text-slate-800">{orderDetails.razorpayOrderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-800">{orderDetails.paymentUniqueId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-800">{orderDetails.customerName || 'Customer'}</span>
                </div>
              </div>

              <div className="border border-emerald-100 bg-emerald-50/50 p-4 rounded-2xl text-xs text-emerald-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <Lock className="w-4 h-4 text-emerald-600" /> Payment Method Selection
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-center font-bold text-emerald-800 shadow-2xs">
                    UPI / QR Code
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-emerald-300 text-center font-bold text-emerald-800 shadow-2xs">
                    Card / NetBanking
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <button
                onClick={handleMockPaySuccess}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Simulate Successful Payment
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setShowMockModal(false);
                  setLoading(false);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition text-xs"
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
