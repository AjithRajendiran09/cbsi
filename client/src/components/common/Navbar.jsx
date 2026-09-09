import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  FileSpreadsheet,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isFaculty, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-900 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="font-display font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                CBSI <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 uppercase tracking-wider ml-1">v1.0 Pilot</span>
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-wide">
                Christ Academy Institute for Advanced Studies
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Dashboard</span>
                  </span>
                </Link>

                <Link
                  to="/assessment"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    isActive('/assessment')
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  }`}
                >
                  Take Assessment
                </Link>

                {(isAdmin || isFaculty) && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/admin')
                        ? 'text-amber-700 bg-amber-50'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center space-x-1.5">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>{isAdmin ? 'Admin Console' : 'Faculty Research'}</span>
                    </span>
                  </Link>
                )}

                <div className="h-6 w-px bg-slate-200 mx-2" />

                {/* User menu */}
                <div className="flex items-center space-x-3 pl-2">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user?.name}
                    </p>
                    <span className="inline-block text-[10px] font-medium uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2 pl-4">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Dashboard
              </Link>
              <Link
                to="/assessment"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-blue-700 bg-blue-50"
              >
                Take Assessment
              </Link>
              {(isAdmin || isFaculty) && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-amber-700 bg-amber-50"
                >
                  {isAdmin ? 'Admin Console' : 'Faculty Research'}
                </Link>
              )}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-lg"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
