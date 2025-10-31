'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auth } from '@/lib/firebase.client';
import { sendEmailVerification } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [countdown, setCountdown] = useState(0);
  const [checking, setChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (loading || countdown > 0) return;

    const user = auth.currentUser;
    if (!user) {
      setResendStatus('error');
      return;
    }

    setLoading(true);
    setResendStatus('idle');

    try {
      await sendEmailVerification(user);
      setResendStatus('success');
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('[VerifyEmail] Error resending email:', error);
      setResendStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    setChecking(true);

    try {
      // Reload user to get latest emailVerified status
      await user.reload();

      if (user.emailVerified) {
        // Email is verified, create session and redirect to dashboard
        const idToken = await user.getIdToken(true);

        const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        });

        if (response.ok) {
          const data = await response.json();
          router.push(`/dashboard/${data.role}`);
        } else {
          throw new Error('Failed to create session');
        }
      } else {
        // Not verified yet
        setResendStatus('error');
        setTimeout(() => setResendStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('[VerifyEmail] Error checking verification:', error);
      setResendStatus('error');
      setTimeout(() => setResendStatus('idle'), 3000);
    } finally {
      setChecking(false);
    }
  };

  const userEmail = auth.currentUser?.email;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 flex items-center justify-center"
          >
            <Mail className="w-10 h-10 text-black" />
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-3">
          Verify your email
        </h1>
        <p className="text-gray-300 text-center mb-8">
          We&apos;ve sent a verification email to{' '}
          <span className="font-semibold text-cyan-400">{userEmail}</span>
        </p>

        {/* Instructions */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Next steps:</h2>
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
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span>Come back here and click &quot;I&apos;ve verified my email&quot;</span>
            </li>
          </ol>
        </div>

        {/* Status Messages */}
        {resendStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-300 text-sm">
              Verification email sent! Please check your inbox.
            </p>
          </motion.div>
        )}

        {resendStatus === 'error' && !checking && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
          >
            <p className="text-red-300 text-sm">
              Email not verified yet. Please check your inbox and click the verification link.
            </p>
          </motion.div>
        )}

        {/* Primary Action */}
        <motion.button
          whileHover={!checking ? { scale: 1.02 } : {}}
          whileTap={!checking ? { scale: 0.98 } : {}}
          onClick={handleCheckVerification}
          disabled={checking}
          className={`w-full py-3 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4 mb-4
            ${
              !checking
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:shadow-lg hover:shadow-cyan-500/50 focus:ring-cyan-400/50'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
        >
          {checking ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Checking...
            </span>
          ) : (
            "I've verified my email"
          )}
        </motion.button>

        {/* Resend Email */}
        <button
          onClick={handleResendEmail}
          disabled={loading || countdown > 0}
          className={`w-full py-3 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400
            ${
              loading || countdown > 0
                ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              Sending...
            </span>
          ) : countdown > 0 ? (
            `Resend email (${countdown}s)`
          ) : (
            'Resend verification email'
          )}
        </button>

        {/* Back to Login */}
        <p className="text-center text-sm text-gray-400 mt-8">
          Wrong email?{' '}
          <a
            href="/signup"
            className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
          >
            Sign up again
          </a>
          {' '} or{' '}
          <a
            href="/login"
            className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
          >
            Log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
