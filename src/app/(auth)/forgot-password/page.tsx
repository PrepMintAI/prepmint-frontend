'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authInstance as auth } from '@/lib/firebase.client';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      logger.log('[ForgotPassword] Password reset email sent to:', email);
    } catch (err) {
      logger.error('[ForgotPassword] Error:', err);

      // Handle Firebase errors
      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';

      switch (errorCode) {
        case 'auth/user-not-found':
          setError('No account found with this email address');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address');
          break;
        case 'auth/too-many-requests':
          setError('Too many requests. Please try again later.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8"
      >
        {/* Back Button */}
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to login</span>
        </Link>

        {!success ? (
          <>
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center"
              >
                <Mail className="w-10 h-10 text-black" />
              </motion.div>
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-center text-white mb-3">
              Reset your password
            </h1>
            <p className="text-gray-300 text-center mb-8">
              Enter your email address and we&apos;ll send you a link to reset your password
            </p>

            {/* Error Message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
                >
                  <p className="text-red-300 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  required
                  className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                type="submit"
                disabled={loading}
                className={`w-full py-3 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4
                  ${
                    !loading
                      ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:shadow-lg hover:shadow-cyan-500/50 focus:ring-cyan-400/50'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send reset link'
                )}
              </motion.button>
            </form>
          </>
        ) : (
          // Success State
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-black" />
              </motion.div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Check your email</h2>
            <p className="text-gray-300 mb-6">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-semibold text-cyan-400">{email}</span>
            </p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6 text-left">
              <h3 className="text-lg font-semibold text-white mb-4">Next steps:</h3>
              <ol className="space-y-3 text-gray-300 text-sm">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>Check your email inbox (and spam folder)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <span>Click the password reset link in the email</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>Create a new password and log in</span>
                </li>
              </ol>
            </div>

            <p className="text-gray-400 text-sm mb-4">
              Didn&apos;t receive the email?{' '}
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
              >
                Try again
              </button>
            </p>

            <Link
              href="/login"
              className="inline-block w-full py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Back to login
            </Link>
          </motion.div>
        )}

        {/* Footer */}
        {!success && (
          <p className="text-center text-sm text-gray-400 mt-8">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            >
              Log in
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
