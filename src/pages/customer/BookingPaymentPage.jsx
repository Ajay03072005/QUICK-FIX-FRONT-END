import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, FileText, Banknote } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import PaymentSummary from '../../components/payment/PaymentSummary';
import PaymentStatusBadge from '../../components/payment/PaymentStatusBadge';
import RazorpayCheckoutButton from '../../components/payment/RazorpayCheckoutButton';
import ReceiptModal from '../../components/payment/ReceiptModal';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import { useNotification } from '../../context/NotificationContext';

export default function BookingPaymentPage() {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchBookingAndPayment();
  }, [uniqueId]);

  const fetchBookingAndPayment = async () => {
    try {
      const bookingData = await bookingApi.getBookingById(uniqueId);
      setBooking(bookingData);

      try {
        const paymentData = await paymentApi.getBookingPayment(uniqueId);
        setPayment(paymentData);
      } catch {
        // Payment record not created yet
      }
    } catch (err) {
      showToast('Unable to fetch booking payment details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (verificationData) => {
    navigate(`/customer/payment/result/${verificationData.paymentUniqueId || uniqueId}?status=SUCCESS`);
  };

  const [cashLoading, setCashLoading] = useState(false);

  const handleCashPayment = async () => {
    if (!window.confirm(`Confirm paying ₹${(booking.totalAmount || booking.totalPrice || 0).toFixed(2)} in cash directly to the technician?`)) {
      return;
    }
    setCashLoading(true);
    try {
      const cashRes = await paymentApi.recordCashPayment(booking.bookingUniqueId || uniqueId, booking.customerUniqueId);
      showToast('Cash payment recorded successfully!', 'success');
      navigate(`/customer/payment/result/${cashRes.uniqueId || uniqueId}?status=SUCCESS`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not record cash payment', 'error');
    } finally {
      setCashLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center font-bold text-slate-600">
          Loading checkout session...
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Booking not found</h2>
          <Link to="/customer/bookings" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">
            Back to My Bookings
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isAlreadyPaid = (payment && (payment.status === 'SUCCESS' || payment.status === 'PAID')) || booking.paymentStatus === 'PAID';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link to={`/customer/booking/${uniqueId}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
            <ArrowLeft className="w-4 h-4" /> Back to Booking Tracking
          </Link>
          <PaymentStatusBadge status={isAlreadyPaid ? 'SUCCESS' : (payment?.status || booking.paymentStatus)} />
        </div>

        {/* Page Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Secure Payment Gateway</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Complete Service Payment</h1>
            <p className="text-xs text-slate-400 mt-1">Booking ID: {booking.bookingUniqueId || uniqueId}</p>
          </div>
          <div className="text-right bg-slate-800 p-4 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 block font-medium">Total Amount Due</span>
            <span className="text-2xl font-black text-cyan-400">₹{(booking.totalAmount || booking.totalPrice || 0).toFixed(2)}</span>
          </div>
        </div>

        {isAlreadyPaid ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-emerald-950">Payment Already Confirmed</h2>
              <p className="text-xs text-emerald-800 mt-1">
                Your payment for this booking has been successfully verified server-side.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowReceipt(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
              >
                <FileText className="w-4 h-4" /> View Verified Receipt
              </button>
              <Link
                to="/customer/bookings"
                className="px-5 py-2.5 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-xl text-xs font-bold transition"
              >
                My Bookings
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-7">
              <PaymentSummary booking={booking} />
            </div>

            <div className="md:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" /> Checkout Options
                </h3>
                <p className="text-xs text-slate-500">
                  Pay instantly via Razorpay Checkout using UPI, Credit/Debit cards, NetBanking, or Wallet.
                </p>

                <RazorpayCheckoutButton
                  booking={booking}
                  onPaymentSuccess={handlePaymentSuccess}
                />

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">Or Pay Cash</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={handleCashPayment}
                  disabled={cashLoading}
                  className="w-full py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 font-extrabold text-xs rounded-2xl transition flex items-center justify-center gap-2 border border-slate-200/90 shadow-2xs hover:border-slate-300"
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  {cashLoading ? 'Recording Cash Payment...' : 'Pay Cash Directly to Technician'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showReceipt && (
        <ReceiptModal
          bookingUniqueId={uniqueId}
          paymentUniqueId={payment?.uniqueId}
          onClose={() => setShowReceipt(false)}
        />
      )}

      <Footer />
    </div>
  );
}
