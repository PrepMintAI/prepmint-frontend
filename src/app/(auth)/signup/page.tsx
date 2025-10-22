// src/app/(auth)/signup/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase.client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

async function createSession(idToken: string) {
  await fetch('/api/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
}

export default function SignupPage() {
  const [mode, setMode] = useState<'individual' | 'institution'>('individual');
  const [institutionCode, setInstitutionCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [institutionCodeStatus, setInstitutionCodeStatus] = useState<
    'idle' | 'loading' | 'valid' | 'invalid'
  >('idle');
  const [institutionCodeError, setInstitutionCodeError] = useState<string | null>(null);

  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const instCodeRef = useRef<HTMLInputElement>(null);

  // Debounced institution code for validation
  const debouncedInstitutionCode = useDebounce(institutionCode, 500);

  // Validate email in real-time
  useEffect(() => {
    if (email === '') {
      setEmailValid(null);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  // Validate password strength
  useEffect(() => {
    if (password === '') {
      setPasswordValid(null);
      return;
    }
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    setPasswordValid(minLength && hasUpper && hasNumber && hasSpecial);
  }, [password]);

  // Validate institution code when changed (debounced)
  useEffect(() => {
    if (mode !== 'institution' || debouncedInstitutionCode.trim() === '') {
      setInstitutionCodeStatus('idle');
      setInstitutionCodeError(null);
      return;
    }

    const validateInstitutionCode = async () => {
      setInstitutionCodeStatus('loading');
      setInstitutionCodeError(null);

      try {
        const instSnap = await getDoc(doc(db, 'institutions', debouncedInstitutionCode.trim()));
        if (instSnap.exists()) {
          setInstitutionCodeStatus('valid');
        } else {
          setInstitutionCodeStatus('invalid');
          setInstitutionCodeError('Invalid institution code');
        }
      } catch (err) {
        setInstitutionCodeStatus('invalid');
        setInstitutionCodeError('Validation failed. Try again.');
      }
    };

    validateInstitutionCode();
  }, [debouncedInstitutionCode, mode]);

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    // Final validation
    if (emailValid === false) {
      emailRef.current?.focus();
      return;
    }
    if (passwordValid === false) {
      passwordRef.current?.focus();
      return;
    }
    if (mode === 'institution' && institutionCodeStatus !== 'valid') {
      instCodeRef.current?.focus();
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });

      // Force token refresh
      await cred.user.getIdToken(true);

      await setDoc(doc(db, 'users', cred.user.uid), {
        name,
        email,
        role: 'student',
        institutionCode: mode === 'institution' ? institutionCode.trim() : null,
        createdAt: Timestamp.now(),
      });

      const idToken = await cred.user.getIdToken();
      await createSession(idToken);

      router.push('/dashboard/student');
    } catch (e: any) {
      setSubmitError(e?.message ?? 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  // Input shake animation variant
  const shakeAnimation = {
    hidden: { x: 0 },
    shake: { x: [-10, 10, -10, 10, -5, 5, -2, 2, 0] },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8">
        {/* Gradient P Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-center text-white">Create your account</h1>
        <p className="text-sm text-gray-300 text-center mb-6">Join us and start your journey 🚀</p>

        {/* Toggle buttons */}
        <div className="flex space-x-2 mb-6">
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'individual'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            onClick={() => setMode('individual')}
            aria-pressed={mode === 'individual'}
          >
            Individual
          </button>
          <button
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'institution'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            onClick={() => setMode('institution')}
            aria-pressed={mode === 'institution'}
          >
            Institution
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSignup} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address
            </label>
            <motion.div variants={shakeAnimation} initial="hidden" animate={emailValid === false ? 'shake' : 'hidden'}>
              <input
                ref={emailRef}
                id="email"
                type="email"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition 
                  ${
                    emailValid === false
                      ? 'border-red-500 focus:ring-red-500 animate-shake'
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={emailValid === false}
                aria-describedby={emailValid === false ? 'email-error' : undefined}
              />
            </motion.div>
            {emailValid === false && (
              <p id="email-error" className="text-red-400 text-xs mt-1" aria-live="polite">
                Please enter a valid email address.
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <div className="relative">
              <motion.div
                variants={shakeAnimation}
                initial="hidden"
                animate={passwordValid === false ? 'shake' : 'hidden'}
              >
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition 
                    ${
                      passwordValid === false
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/20 focus:ring-cyan-400'
                    }`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={passwordValid === false}
                  aria-describedby={passwordValid === false ? 'password-error' : undefined}
                />
              </motion.div>
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.5a10.528 10.528 0 01-2.05 3.772M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
            {passwordValid === false && (
              <p id="password-error" className="text-red-400 text-xs mt-1" aria-live="polite">
                Password must be 8+ chars with uppercase, number, and symbol.
              </p>
            )}
          </div>

          {/* Institution Code (conditionally rendered with animation) */}
          <AnimatePresence>
            {mode === 'institution' && (
              <motion.div
                key="institution-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div>
                  <label htmlFor="institution-code" className="block text-sm font-medium text-gray-300 mb-1">
                    Institution Code
                  </label>
                  <div className="relative">
                    <motion.div
                      variants={shakeAnimation}
                      initial="hidden"
                      animate={institutionCodeStatus === 'invalid' ? 'shake' : 'hidden'}
                    >
                      <input
                        ref={instCodeRef}
                        id="institution-code"
                        className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition 
                          ${
                            institutionCodeStatus === 'invalid'
                              ? 'border-red-500 focus:ring-red-500'
                              : institutionCodeStatus === 'valid'
                              ? 'border-green-500 focus:ring-green-500'
                              : 'border-white/20 focus:ring-cyan-400'
                          }`}
                        placeholder="ABC123"
                        value={institutionCode}
                        onChange={(e) => setInstitutionCode(e.target.value)}
                        required
                        aria-invalid={institutionCodeStatus === 'invalid'}
                        aria-describedby={
                          institutionCodeStatus === 'invalid'
                            ? 'institution-code-error'
                            : institutionCodeStatus === 'valid'
                            ? 'institution-code-valid'
                            : undefined
                        }
                      />
                    </motion.div>

                    {/* Validation status icon */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {institutionCodeStatus === 'loading' && (
                        <svg className="animate-spin h-5 w-5 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      {institutionCodeStatus === 'valid' && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-500">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {institutionCodeStatus === 'invalid' && institutionCodeError && (
                    <p id="institution-code-error" className="text-red-400 text-xs mt-1" aria-live="polite">
                      {institutionCodeError}
                    </p>
                  )}
                  {institutionCodeStatus === 'valid' && (
                    <p id="institution-code-valid" className="text-green-400 text-xs mt-1" aria-live="polite">
                      Institution verified ✅
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Error */}
          {submitError && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-400 text-sm text-center py-2 px-4 bg-red-400/10 rounded-lg"
              aria-live="assertive"
            >
              {submitError}
            </motion.p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold rounded-xl hover:opacity-90 disabled:opacity-70 transition"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/20"></div>
          <span className="px-2 text-gray-400 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/20"></div>
        </div>

        {/* Google Signup */}
        <button className="w-full flex items-center justify-center gap-2 py-3 border border-white/20 bg-white/5 text-white rounded-xl hover:bg-white/10 transition">
          <Image src="/google-icon.png" alt="Google" width={20} height={20} />
          <span className="font-medium">Sign up with Google</span>
        </button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-300 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-cyan-400 font-medium hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}