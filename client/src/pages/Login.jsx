import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, AlertCircle, ArrowRight, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get('expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'faculty') {
        navigate('/faculty');
      } else {
        navigate(from === '/login' || from === '/register' ? '/dashboard' : from);
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to server. Please verify the backend server is running on port 5001.');
      } else {
        setError(
          err.response?.data?.message || 'Login failed. Please check your credentials.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center space-y-3">
          <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
            <img
              src="/caias-logo.png"
              alt="CAIAS - Christ Academy Institute for Advanced Studies"
              className="h-14 sm:h-16 w-auto object-contain mx-auto"
            />
          </Link>
          <div className="pt-1">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Sign In to CBSI
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Behavioural Style Inventory • Version 1.0 Pilot
            </p>
          </div>
        </div>

        {sessionExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@caias.in"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-blue-600 hover:underline">
            Register for CBSI
          </Link>
        </div>

        {/* Demo Credentials Helper */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-3">
          <p className="font-semibold text-slate-800">Quick-Fill Demo Credentials:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@caias.in');
                setPassword('Admin@123');
                setError('');
              }}
              className="text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all text-xs"
            >
              <div className="font-semibold text-blue-700 flex items-center justify-between">
                <span>Admin</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">Use</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">admin@caias.in</div>
              <div className="text-[11px] text-slate-400 font-mono">Pass: Admin@123</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('student@caias.in');
                setPassword('Student@123');
                setError('');
              }}
              className="text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all text-xs"
            >
              <div className="font-semibold text-emerald-700 flex items-center justify-between">
                <span>Student</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Use</span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">student@caias.in</div>
              <div className="text-[11px] text-slate-400 font-mono">Pass: Student@123</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
