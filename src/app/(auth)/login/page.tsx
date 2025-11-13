// src/app/(auth)/login/page.tsx
'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { logger } from '@/lib/logger';
import { AuthError } from '@supabase/supabase-js';

const getSupabaseErrorMessage = (error: AuthError | Error): string => {
  if ('status' in error) {
    // Supabase AuthError
    const authError = error as AuthError;
    switch (authError.message) {
      case 'Invalid login credentials':
        return 'Invalid email or password. Please check your credentials.';
      case 'Email not confirmed':
        return 'Please verify your email address before logging in.';
      case 'User not found':
        return 'No account found with this email. Please sign up first.';
      default:
        return authError.message || 'Login failed. Please try again.';
    }
  }
  return 'Login failed. Please try again.';
};

interface FormErrors {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [touched, setTouched] = useState({ email: false, password: false });

  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ email: true, password: true });
    return isValid;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (isSubmitting) return;

    if (!validateForm()) {
      if (errors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (errors.password && passwordRef.current) {
        passwordRef.current.focus();
      }
      return;
    }

    setIsSubmitting(true);

    try {
      logger.log('[Login] Attempting login with Supabase...');

      // Sign in with Supabase (handles session automatically)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      logger.log('[Login] Login successful!');

      // Fetch user profile to get role
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single<{ role: string }>();

      if (profileError) {
        logger.warn('[Login] Could not fetch profile, using default role');
      }

      const role = (profile?.role || data.user.user_metadata?.role || 'student') as string;

      // Dev role uses /dashboard (router will handle redirect to student)
      const dashboardPath = role === 'dev' ? '/dashboard' : `/dashboard/${role}`;

      logger.log('[Login] Redirecting to:', dashboardPath);

      // Clear form
      setEmail('');
      setPassword('');

      // Redirect to dashboard
      router.push(dashboardPath);

    } catch (err) {
      logger.error('[Login] Error:', err);

      const errorMessage = getSupabaseErrorMessage(err as AuthError);
      setAuthError(errorMessage);

      setPassword('');

      if (passwordRef.current) {
        passwordRef.current.focus();
      }

      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      logger.log('[Login] Attempting Google login...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // OAuth redirects automatically, no need to handle redirect here

    } catch (err) {
      logger.error('[Login] Google error:', err);
      setAuthError(getSupabaseErrorMessage(err as AuthError));
      setIsSubmitting(false);
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Animation variants
  const shakeAnimation = {
    shake: {
      x: [0, -8, 8, -8, 8, 0],
      transition: { duration: 0.4 },
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 sm:p-8"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center shadow-lg"
          >
            <span className="text-white font-bold text-2xl">P</span>
          </motion.div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white mb-2">
          Welcome back
        </h1>
        <p className="text-sm text-gray-300 text-center mb-8">
          Log in to continue your learning journey 🚀
        </p>

        {/* Error Banner */}
        <AnimatePresence mode="wait">
          {authError && (
            <motion.div
              {...fadeIn}
              role="alert"
              aria-live="assertive"
              className="mb-5 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-red-300 text-sm flex-1">{authError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email address <span className="text-red-400" aria-label="required">*</span>
            </label>
            <motion.div
              animate={errors.email && touched.email ? 'shake' : ''}
              variants={shakeAnimation}
            >
              <input
                id="email"
                ref={emailRef}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                disabled={isSubmitting}
                required
                aria-required="true"
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400
                  focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-white/20 focus:ring-cyan-400 focus:border-cyan-400'
                  }`}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.email && touched.email && (
                <motion.p
                  {...fadeIn}
                  id="email-error"
                  role="alert"
                  className="mt-1.5 text-red-400 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password <span className="text-red-400" aria-label="required">*</span>
              </label>
              <a
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition"
                tabIndex={-1}
              >
                Forgot?
              </a>
            </div>
            <motion.div
              animate={errors.password && touched.password ? 'shake' : ''}
              variants={shakeAnimation}
            >
              <div className="relative">
                <input
                  id="password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  required
                  aria-required="true"
                  aria-invalid={!!(errors.password && touched.password)}
                  aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400
                    focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-white/20 focus:ring-cyan-400 focus:border-cyan-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white
                    transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
                    focus:ring-2 focus:ring-cyan-400 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.password && touched.password && (
                <motion.p
                  {...fadeIn}
                  id="password-error"
                  role="alert"
                  className="mt-1.5 text-red-400 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!isSubmitting ? { scale: 1.02 } : {}}
            whileTap={!isSubmitting ? { scale: 0.98 } : {}}
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 font-semibold rounded-xl transition-all focus:outline-none focus:ring-4
              ${
                !isSubmitting
                  ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black hover:shadow-lg hover:shadow-cyan-500/50 focus:ring-cyan-400/50'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/20" />
          <span className="px-3 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow h-px bg-white/20" />
        </div>

        {/* Google Login */}
        <motion.button
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 border border-white/20 bg-white/5
            text-white rounded-xl hover:bg-white/10 transition font-medium disabled:opacity-50
            disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <Image
            src="/google-icon.png"
            alt=""
            width={20}
            height={20}
            className="opacity-90"
            aria-hidden="true"
          />
          Continue with Google
        </motion.button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-300 mt-8">
          Don&apos;t have an account?{' '}
          <a
            href="/signup"
            className="text-cyan-400 font-medium hover:text-cyan-300 hover:underline transition focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded"
            aria-label="Sign up for a new account"
          >
            Sign up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
