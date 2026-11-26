import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';
import { useNotification } from '../../context/NotificationContext';

export default function LoginPage() {
  const location = useLocation();
  const role = location.pathname.startsWith('/provider/') ? 'PROVIDER' : 'CUSTOMER';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.login({ email, password, role });
      login(data.role, data.user, data.token);
      showToast(`Logged in successfully as ${data.role}`, 'success');
      if (data.role === 'PROVIDER') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Wrench className="w-6 h-6" />
          </div>
          <span className="text-3xl font-extrabold text-white">
            Quick<span className="text-emerald-400">-Fix</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-200">Welcome Back</h2>
        <p className="text-xs text-slate-400">Sign in to your Quick-Fix account</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-3xl border border-slate-200 sm:px-10 space-y-6">
          
          <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800 border border-emerald-100">
            {role === 'PROVIDER' ? 'Service Provider Portal' : 'Customer Portal'}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email or Phone</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder={role === 'CUSTOMER' ? 'ajay.ram@example.com' : 'kumar.services@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">Password</label>
                <Link to="/forgot-password" className="text-xs font-bold text-emerald-700 hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
            >
              {loading ? 'Logging in...' : `Login as ${role}`} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
              Use your registered account credentials.
            </p>
          </div>

          <div className="text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to={role === 'PROVIDER' ? '/provider/register' : '/customer/register'} className="font-bold text-emerald-700 hover:underline">
              Create Account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
