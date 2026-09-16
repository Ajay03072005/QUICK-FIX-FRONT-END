import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import StarRating from '../../components/common/StarRating';
import { useNotification } from '../../context/NotificationContext';

export default function ReviewsPage() {
  const { showToast } = useNotification();
  const [reviews, setReviews] = useState([
    {
      id: 'REV-01',
      providerName: 'Kumar AC & Electrical Services',
      serviceName: 'Switchboard Repair',
      rating: 5,
      date: '10 Sep 2026',
      comment: 'Super fast arrival within 20 mins. Fixed the short circuit right away.'
    },
    {
      id: 'REV-02',
      providerName: 'Sparkle Clean Home Pros',
      serviceName: 'Full Bathroom Deep Cleaning',
      rating: 5,
      date: '02 Sep 2026',
      comment: 'Tiles look brand new! Very polite and professional team.'
    }
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      <main className="container mx-auto px-4 lg:px-8 py-8 flex-1 space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Service Reviews</h1>
          <p className="text-xs text-slate-500">Feedback and ratings you have shared for past services</p>
        </div>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{rev.providerName}</h3>
                  <p className="text-xs text-slate-500">{rev.serviceName} • Reviewed on {rev.date}</p>
                </div>
                <StarRating rating={rev.rating} size="md" />
              </div>
              <p className="text-xs text-slate-700 italic bg-slate-50 p-4 rounded-2xl border border-slate-100">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
