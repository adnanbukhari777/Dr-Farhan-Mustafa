import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Clock,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';

interface AdminLoginProps {
  onBackToPublicSite: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToPublicSite }) => {
  const { login } = useCMS();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutAlert, setLockoutAlert] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLockoutAlert(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(cleanEmail, password);
      if (!result.success) {
        if (result.error === 'rate_limited') {
          setLockoutAlert(result.message || 'Too many attempts. Please wait before trying again.');
        } else {
          setErrorMessage(result.message || 'Invalid email or password credentials.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'A network error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="admin-login-screen" className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-['Montserrat',sans-serif]">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2097A2]/20 via-slate-900 to-slate-950 -z-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Clinic & Portal Branding */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#2097A2] text-white shadow-lg shadow-[#2097A2]/30 mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Clinic CMS Portal
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Dr. Farhan Mustafa (FCPS, MRCP UK) • HealthPro Medical Complex, Lahore
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-800/90 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-slate-700/80 sm:px-10">
          {/* Lockout Warning Banner */}
          {lockoutAlert && (
            <div id="auth-lockout-banner" className="mb-6 p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-3">
              <Clock className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-200">
                <div className="font-bold text-rose-100 mb-1">Temporary Security Lockout</div>
                {lockoutAlert}
              </div>
            </div>
          )}

          {/* Error Message Banner */}
          {errorMessage && (
            <div id="auth-error-banner" className="mb-6 p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-200">
                <div className="font-bold text-amber-100 mb-0.5">Authentication Failed</div>
                {errorMessage}
              </div>
            </div>
          )}

          <form id="admin-login-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@healthpro.com.pk"
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2097A2] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-200 mb-1.5">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#2097A2] focus:border-transparent transition"
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                id="admin-submit-login-btn"
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#2097A2] hover:bg-[#1b8089] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2097A2] focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to Admin CMS</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            id="back-to-public-site-btn"
            onClick={onBackToPublicSite}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>
        </div>
      </div>
    </div>
  );
};
