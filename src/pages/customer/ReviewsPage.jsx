import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Loader2, Plus } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import EmptyState from '../../components/common/EmptyState';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { reviewApi } from '../../api/reviewApi';
import { bookingApi } from '../../api/bookingApi';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { showToast } = useNotification();
  const customerId = user?.uniqueId || user?.customerUniqueId || 'CUST-DEMO1';

  const [reviews, setReviews] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [customerId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [revData, bkgData] = await Promise.all([
        reviewApi.getCustomerReviews(customerId),
        bookingApi.getCustomerBookings(customerId)
      ]);
      setReviews(revData);
      
      // Filter completed bookings
      const completed = (bkgData || []).filter(b => b.status === 'COMPLETED');
      setCompletedBookings(completed);
    } catch (err) {
      console.warn("Could not fetch reviews/bookings from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBookingId) {
      showToast('Please select a completed booking to review', 'error');
      return;
    }
    try {
      setSubmitting(true);
      await reviewApi.createReview(customerId, {
        bookingUniqueId: selectedBookingId,
        rating: Number(rating),
        comment
      });
      showToast('Review submitted successfully!', 'success');
      setShowModal(false);
      setSelectedBookingId('');
      setComment('');
      setRating(5);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Service Reviews</h1>
            <p className="text-xs text-slate-500">Ratings and feedback you have shared for completed services</p>
          </div>
          {completedBookings.length > 0 && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Add Review
            </button>
          )}
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-xs text-slate-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            title="No reviews submitted yet"
            description="Complete a home service booking to leave feedback for your service provider."
            actionLabel={completedBookings.length > 0 ? "Write a Review" : "View My Bookings"}
            onAction={() => completedBookings.length > 0 ? setShowModal(true) : window.location.href = '/customer/bookings'}
          />
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.uniqueId} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{rev.providerName || 'Quick-Fix Partner'}</h3>
                    <p className="text-xs text-slate-500">Booking: #{rev.bookingUniqueId} • {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}</p>
                  </div>
                  <StarRating rating={rev.rating} size="md" />
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-700 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    "{rev.comment}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 shadow-2xl border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900">Leave a Service Review</h2>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Completed Booking</label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">-- Choose Booking --</option>
                  {completedBookings.map(b => (
                    <option key={b.bookingUniqueId} value={b.bookingUniqueId}>
                      #{b.bookingUniqueId} - {b.serviceName || 'Service'} ({b.bookingDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition ${rating >= star ? 'text-amber-400 bg-amber-50' : 'text-slate-300 bg-slate-100'}`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Feedback Comments</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the service quality, punctuality, and professionalism..."
                  className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
