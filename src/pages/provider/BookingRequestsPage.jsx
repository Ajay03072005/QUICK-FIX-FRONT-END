import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, MapPin, Calendar, Clock, User, ShieldCheck } from 'lucide-react';
import ProviderPortalNav from '../../components/provider/ProviderPortalNav';
import Footer from '../../components/common/Footer';
import EmptyState from '../../components/common/EmptyState';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

export default function BookingRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const { showToast } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.providerUniqueId) fetchRequests();
  }, [user]);

  const fetchRequests = () => {
    bookingApi.getProviderBookings(user.providerUniqueId).then(data => {
      setRequests(data.filter(b => b.status === 'WAITING_FOR_PROVIDER' || b.status === 'PENDING'));
      setLoading(false);
    });
  };

  const handleAccept = async (id) => {
    await bookingApi.acceptBookingRequest(id);
    showToast('Booking Accepted!', 'success');
    navigate(`/provider/active-service/${id}`);
  };

  const handleReject = async () => {
    if (rejectingId) {
      await bookingApi.rejectBookingRequest(rejectingId, rejectReason);
      showToast('Booking Request Rejected', 'info');
      setRejectingId(null);
      setRejectReason('');
      fetchRequests();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <ProviderPortalNav />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Incoming Booking Requests</h1>
          <p className="text-xs text-slate-500">Accept or decline requests from nearby customers</p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <EmptyState
            title="No Pending Booking Requests"
            description="You have responded to all incoming customer requests."
          />
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req.bookingUniqueId}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="px-3 py-1 bg-amber-50 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                    New Request
                  </span>
                  <span className="text-xs font-bold text-slate-400">ID: {req.bookingUniqueId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-slate-400 uppercase">Service Requested</span>
                    <h3 className="font-extrabold text-slate-900 text-lg">{req.serviceName}</h3>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-400 uppercase">Customer Name</span>
                    <p className="font-bold text-slate-800 text-base">{req.customerName || 'Rahul'}</p>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-400 uppercase">Location</span>
                    <p className="font-semibold text-slate-700">{req.customerAddress} ({req.distanceKm || '2.4'} km away)</p>
                  </div>

                  <div>
                    <span className="block font-bold text-slate-400 uppercase">Scheduled Slot</span>
                    <p className="font-semibold text-indigo-600">{req.bookingDate} at {req.bookingTime}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Job Price</span>
                    <span className="text-2xl font-extrabold text-indigo-600">₹{req.totalPrice || 450}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setRejectingId(req.bookingUniqueId)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(req.bookingUniqueId)}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                    >
                      Accept Request
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Decline Booking Request</h3>
            <p className="text-xs text-slate-500">Optionally provide a reason for declining this request.</p>
            <textarea
              rows={3}
              placeholder="e.g. Schedule overlap, outside service zone..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectingId(null)}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-rose-600 text-white text-xs font-bold rounded-xl"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
