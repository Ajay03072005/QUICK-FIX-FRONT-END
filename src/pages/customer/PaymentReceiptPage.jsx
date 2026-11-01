import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import ReceiptModal from '../../components/payment/ReceiptModal';

export default function PaymentReceiptPage() {
  const { paymentRef } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      <div className="flex-1">
        <ReceiptModal
          paymentUniqueId={paymentRef}
          bookingUniqueId={paymentRef}
          onClose={() => navigate(-1)}
        />
      </div>
      <Footer />
    </div>
  );
}
