import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Mail, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const { requestPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    const { error, resetLink: link } = await requestPasswordReset(email);
    
    if (error) {
      toast.error(error);
    } else {
      toast.success('Password reset link generated!');
      setResetLink(link || null);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-lg">
                <Droplets className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                MoodMoment
              </h1>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-600">Enter your email to receive a reset link</p>
          </div>

          {resetLink ? (
            <div className="text-center space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 font-medium mb-2">Reset Link Generated!</p>
                <p className="text-sm text-green-600 mb-4">
                  In a production environment, this would be sent to your email. For demo purposes, use the link below:
                </p>
                <a
                  href={resetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 underline text-sm font-medium"
                >
                  <span>Open Reset Link</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                      placeholder="you@example.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-medium hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center space-x-2 text-gray-600 hover:text-green-600"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}