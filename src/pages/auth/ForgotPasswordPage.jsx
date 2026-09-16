import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    showToast('Password reset link sent to your email', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold text-white">
            Quick<span className="text-indigo-400">-Fix</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-200">Reset Your Password</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Check Your Inbox</h3>
              <p className="text-xs text-slate-500">
                We sent a password reset link to <strong className="text-slate-800">{email}</strong>.
              </p>
              <Link to="/login" className="inline-block py-2.5 px-6 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your registered email address below and we'll send you instructions to reset your password.
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg transition"
              >
                Send Reset Link
              </button>
            </form>
          )}

          <div className="text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
