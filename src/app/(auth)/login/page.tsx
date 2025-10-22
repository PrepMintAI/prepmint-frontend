// src/app/login/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase.client';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firebaseError, setFirebaseError] = useState('');
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Real-time validation
  useEffect(() => {
    if (email) {
      const isValidEmail = /\S+@\S+\.\S+/.test(email);
      setErrors((prev) => ({
        ...prev,
        email: !isValidEmail ? 'Please enter a valid email.' : '',
      }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  }, [email]);

  useEffect(() => {
    if (password) {
      setErrors((prev) => ({ ...prev, password: '' }));
    } else {
      setErrors((prev) => ({ ...prev, password: 'Password is required.' }));
    }
  }, [password]);

  const isFormValid = email && password && !errors.email && !errors.password;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFirebaseError('');

    // Trigger shake if invalid
    if (!isFormValid) {
      if (!email && emailRef.current) emailRef.current.focus();
      if (!password && passwordRef.current) passwordRef.current.focus();
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard/student');
    } catch (err: any) {
      setFirebaseError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shakeAnimation = {
    shake: {
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.3, ease: 'easeInOut' },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8">
        
        {/* Gradient P Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-gray-300 text-center mb-8">
          Log in to continue your learning journey 🚀
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <motion.div
              variants={errors.email ? shakeAnimation : {}}
              animate={errors.email ? 'shake' : ''}
            >
              <input
                id="email"
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition
                  ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
              />
            </motion.div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-red-400 text-sm" role="alert">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <motion.div
              variants={errors.password ? shakeAnimation : {}}
              animate={errors.password ? 'shake' : ''}
            >
              <div className="relative">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition pr-12
                    ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/20 focus:ring-cyan-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
            {errors.password && (
              <p id="password-error" className="mt-1 text-red-400 text-sm" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {/* Firebase Error */}
          {firebaseError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl"
            >
              <p className="text-red-400 text-sm text-center">{firebaseError}</p>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full py-3 font-semibold rounded-xl transition-all
              ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:shadow-lg'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/20"></div>
          <span className="px-3 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow h-px bg-white/20"></div>
        </div>

        {/* Google Login */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-3 py-3 border border-white/20 bg-white/5 text-white rounded-xl hover:bg-white/10 transition font-medium"
        >
          <Image src="/google-icon.png" alt="Google" width={20} height={20} className="opacity-90" />
          Continue with Google
        </motion.button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-300 mt-8">
          Don’t have an account?{' '}
          <a
            href="/signup"
            className="text-cyan-400 font-medium hover:underline transition"
            aria-label="Sign up for a new account"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}