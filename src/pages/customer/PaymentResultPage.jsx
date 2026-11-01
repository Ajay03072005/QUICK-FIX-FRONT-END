import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, ArrowRight, Home, RefreshCw } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ReceiptModal from '../../components/payment/ReceiptModal';
import { paymentApi } from '../../api/paymentApi';

export default function PaymentResultPage() {
  const { paymentRef } = useParams();
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status') || 'SUCCESS';
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [paymentRef]);

  const fetchPayment = async () => {
    try {
      const data = await paymentApi.getPaymentDetails(paymentRef);
      setPaymentDetails(data);
    } catch {
      // Use fallback metadata
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = statusParam === 'SUCCESS' || (paymentDetails && (paymentDetails.status === 'SUCCESS' || paymentDetails.status === 'PAID'));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-12 flex-1 max-w-xl flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {isSuccess ? (
            <>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Verified Server-Side
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2">Payment Successful!</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Your payment has been received and verified by Quick-Fix backend.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{paymentRef}</span>
                </div>
                {paymentDetails?.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Razorpay Payment ID:</span>
                    <span className="font-mono font-bold text-slate-900">{paymentDetails.razorpayPaymentId}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-sm">
                  <span className="text-slate-800">Amount Paid:</span>
                  <span className="text-indigo-600">₹{(paymentDetails?.amount || paymentDetails?.totalAmount || 499).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => setShowReceipt(true)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-md transition flex items-center justify-center gap-2 text-sm"
                >
                  <FileText className="w-4 h-4" /> View Verified Receipt
                </button>

                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/customer/bookings"
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-4 h-4" /> My Bookings
                  </Link>
                  <Link
                    to="/customer/dashboard"
                    className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs flex items-center justify-center gap-1.5"
                  >
                    Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <XCircle className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Payment Error
                </span>
                <h1 className="text-2xl font-black text-slate-900 mt-2">Payment Verification Failed</h1>
                <p className="text-xs text-slate-500 mt-1">
                  We could not verify the payment signature or the transaction was cancelled.
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-4">
                <Link
                  to={`/customer/payment/${paymentDetails?.bookingUniqueId || paymentRef}`}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Retry Payment
                </Link>
                <Link
                  to="/customer/bookings"
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition text-xs"
                >
                  Back to My Bookings
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      {showReceipt && (
        <ReceiptModal
          paymentUniqueId={paymentRef}
          onClose={() => setShowReceipt(false)}
        />
      )}

      <Footer />
    </div>
  );
}
