// src/app/(auth)/signup/page.tsx
'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db } from '@/lib/firebase.client';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Firebase error code mapping
const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters with mixed case and numbers.',
    'auth/operation-not-allowed': 'Sign up is currently disabled. Contact support.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  };

  return errorMessages[errorCode] || 'Sign up failed. Please try again.';
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function SignupPage() {
  const [mode, setMode] = useState<'individual' | 'institution'>('individual');
  const [institutionCode, setInstitutionCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validation states
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    institutionCode: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [institutionCodeStatus, setInstitutionCodeStatus] = useState<
    'idle' | 'loading' | 'valid' | 'invalid'
  >('idle');
  const [institutionCodeError, setInstitutionCodeError] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string>('');

  const router = useRouter();
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const instCodeRef = useRef<HTMLInputElement>(null);

  // Debounced institution code for validation
  const debouncedInstitutionCode = useDebounce(institutionCode, 500);

  // REMOVED: onAuthStateChanged check - let server-side handle redirects

  // Validate name in real-time
  useEffect(() => {
    if (touched.name) {
      if (!name.trim()) {
        setErrors((prev) => ({ ...prev, name: 'Full name is required' }));
      } else if (name.trim().length < 2) {
        setErrors((prev) => ({ ...prev, name: 'Name must be at least 2 characters' }));
      } else {
        setErrors((prev) => ({ ...prev, name: '' }));
      }
    }
  }, [name, touched.name]);

  // Validate email in real-time
  useEffect(() => {
    if (touched.email) {
      if (!email) {
        setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      } else {
        setErrors((prev) => ({ ...prev, email: '' }));
      }
    }
  }, [email, touched.email]);

  // Validate password strength
  useEffect(() => {
    if (touched.password) {
      if (!password) {
        setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      } else if (password.length < 8) {
        setErrors((prev) => ({ ...prev, password: 'Password must be at least 8 characters' }));
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        setErrors((prev) => ({
          ...prev,
          password: 'Password must include uppercase, lowercase, and number',
        }));
      } else {
        setErrors((prev) => ({ ...prev, password: '' }));
      }
    }
  }, [password, touched.password]);

  // Validate confirm password
  useEffect(() => {
    if (touched.confirmPassword) {
      if (!confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      } else if (password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  }, [password, confirmPassword, touched.confirmPassword]);

  // Validate institution code when changed (debounced)
  useEffect(() => {
    if (mode !== 'institution' || debouncedInstitutionCode.trim() === '') {
      setInstitutionCodeStatus('idle');
      setInstitutionCodeError(null);
      setInstitutionName('');
      return;
    }

    const validateInstitutionCode = async () => {
      setInstitutionCodeStatus('loading');
      setInstitutionCodeError(null);
      setInstitutionName('');

      try {
        console.log('[Signup] Validating institution code:', debouncedInstitutionCode);
        const instSnap = await getDoc(doc(db, 'institutions', debouncedInstitutionCode.trim()));
        
        if (instSnap.exists()) {
          const instData = instSnap.data();
          setInstitutionCodeStatus('valid');
          setInstitutionName(instData.name || 'Institution');
          console.log('[Signup] Valid institution:', instData.name);
        } else {
          setInstitutionCodeStatus('invalid');
          setInstitutionCodeError('Invalid institution code');
          console.log('[Signup] Invalid institution code');
        }
      } catch (err) {
        console.error('[Signup] Institution validation error:', err);
        setInstitutionCodeStatus('invalid');
        setInstitutionCodeError('Validation failed. Try again.');
      }
    };

    validateInstitutionCode();
  }, [debouncedInstitutionCode, mode]);

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
      isValid = false;
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.password = 'Password must include uppercase, lowercase, and number';
      isValid = false;
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({ name: true, email: true, password: true, confirmPassword: true, institutionCode: true });
    return isValid;
  };

  const onSignup = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (loading) {
      console.log('[Signup] Already processing, ignoring');
      return;
    }

    // Final validation
    if (!validateForm()) {
      if (errors.name && nameRef.current) {
        nameRef.current.focus();
      } else if (errors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (errors.password && passwordRef.current) {
        passwordRef.current.focus();
      } else if (errors.confirmPassword && confirmPasswordRef.current) {
        confirmPasswordRef.current.focus();
      }
      return;
    }

    if (mode === 'institution' && institutionCodeStatus !== 'valid') {
      instCodeRef.current?.focus();
      setSubmitError('Please enter a valid institution code');
      return;
    }

    setLoading(true);

    try {
      console.log('[Signup] Creating user account...');
      
      // Step 1: Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[Signup] Auth user created:', cred.user.uid);

      // Step 2: Update display name
      await updateProfile(cred.user, { displayName: name.trim() });

      // Step 3: Send email verification
      console.log('[Signup] Sending verification email...');
      await sendEmailVerification(cred.user);
      console.log('[Signup] Verification email sent');

      // Step 4: Get ID token
      const idToken = await cred.user.getIdToken(true);

      // Step 5: Create Firestore user profile
      const userProfile = {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name.trim(),
        role: 'student', // Default role
        xp: 0,
        level: 1,
        badges: [],
        institutionId: mode === 'institution' ? institutionCode.trim() : null,
        institutionName: mode === 'institution' ? institutionName : null,
        accountType: mode,
        photoURL: cred.user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      };

      console.log('[Signup] Creating Firestore profile...');
      await setDoc(doc(db, 'users', cred.user.uid), userProfile);

      console.log('[Signup] Account created successfully! Redirecting to email verification...');

      // Redirect to email verification page instead of dashboard
      router.push('/verify-email');
      
    } catch (e) {
      console.error('[Signup] Signup error:', e);
      const errorCode = e && typeof e === 'object' && 'code' in e ? (e as { code: string }).code : '';
      const errorMessage = getFirebaseErrorMessage(errorCode);
      setSubmitError(errorMessage);
      
      // Clear passwords on error
      setPassword('');
      setConfirmPassword('');
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setSubmitError(null);
    
    if (loading) return;
    
    setLoading(true);

    try {
      console.log('[Signup] Attempting Google signup...');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get ID token
      const idToken = await result.user.getIdToken();
      
      // Check if user profile exists
      const userDocRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        // New user, create profile
        const userProfile = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName || '',
          role: 'student',
          xp: 0,
          level: 1,
          badges: [],
          institutionId: null,
          institutionName: null,
          accountType: 'individual',
          photoURL: result.user.photoURL || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        };

        await setDoc(userDocRef, userProfile);
      }
      
      // Create session cookie
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      router.push(`/dashboard/${sessionData.role}`);
      
    } catch (err) {
      console.error('[Signup] Google signup error:', err);

      const errorCode = err && typeof err === 'object' && 'code' in err ? (err as { code: string }).code : '';

      if (errorCode === 'auth/popup-closed-by-user') {
        setSubmitError('Sign-up cancelled. Please try again.');
      } else if (errorCode === 'auth/popup-blocked') {
        setSubmitError('Pop-up blocked. Please enable pop-ups for this site.');
      } else {
        setSubmitError(getFirebaseErrorMessage(errorCode));
      }
      
      setLoading(false);
    }
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

  // // Show loading state while checking auth or redirecting
  // if (isCheckingAuth || isRedirecting) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617]">
  //       <div className="flex flex-col items-center gap-4">
  //         <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
  //         <p className="text-gray-300 text-sm">
  //           {isRedirecting ? 'Creating your account...' : 'Loading...'}
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#0b1120] to-[#020617] px-4 py-8">
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
        <h1 className="text-3xl font-bold text-center text-white mb-2">Create your account</h1>
        <p className="text-sm text-gray-300 text-center mb-6">Join us and start your journey 🚀</p>

        {/* Toggle buttons */}
        <div className="flex space-x-2 mb-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'individual'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !loading && setMode('individual')}
            aria-pressed={mode === 'individual'}
          >
            Individual
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={loading}
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode === 'institution'
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !loading && setMode('institution')}
            aria-pressed={mode === 'institution'}
          >
            Institution
          </motion.button>
        </div>

        {/* Submit Error Banner */}
        <AnimatePresence mode="wait">
          {submitError && (
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
                <p className="text-red-300 text-sm flex-1">{submitError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={onSignup} className="space-y-4" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Full Name <span className="text-red-400" aria-label="required">*</span>
            </label>
            <motion.div animate={errors.name && touched.name ? 'shake' : ''} variants={shakeAnimation}>
              <input
                ref={nameRef}
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                placeholder="John Doe"
                disabled={loading}
                required
                aria-required="true"
                aria-invalid={!!(errors.name && touched.name)}
                aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 
                  focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    errors.name && touched.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.name && touched.name && (
                <motion.p {...fadeIn} id="name-error" role="alert" className="mt-1.5 text-red-400 text-sm">
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email Address <span className="text-red-400" aria-label="required">*</span>
            </label>
            <motion.div animate={errors.email && touched.email ? 'shake' : ''} variants={shakeAnimation}>
              <input
                ref={emailRef}
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                placeholder="you@example.com"
                disabled={loading}
                required
                aria-required="true"
                aria-invalid={!!(errors.email && touched.email)}
                aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 
                  focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    errors.email && touched.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/20 focus:ring-cyan-400'
                  }`}
              />
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.email && touched.email && (
                <motion.p {...fadeIn} id="email-error" role="alert" className="mt-1.5 text-red-400 text-sm">
                  {errors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password <span className="text-red-400" aria-label="required">*</span>
            </label>
            <motion.div animate={errors.password && touched.password ? 'shake' : ''} variants={shakeAnimation}>
              <div className="relative">
                <input
                  ref={passwordRef}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-invalid={!!(errors.password && touched.password)}
                  aria-describedby={errors.password && touched.password ? 'password-error' : 'password-hint'}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/20 focus:ring-cyan-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white 
                    transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.5a10.528 10.528 0 01-2.05 3.772M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.password && touched.password ? (
                <motion.p {...fadeIn} id="password-error" role="alert" className="mt-1.5 text-red-400 text-sm">
                  {errors.password}
                </motion.p>
              ) : (
                <p id="password-hint" className="mt-1 text-xs text-gray-400">
                  At least 8 characters with uppercase, lowercase, and number
                </p>
              )}
            </AnimatePresence>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm Password <span className="text-red-400" aria-label="required">*</span>
            </label>
            <motion.div animate={errors.confirmPassword && touched.confirmPassword ? 'shake' : ''} variants={shakeAnimation}>
              <div className="relative">
                <input
                  ref={confirmPasswordRef}
                  id="confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  aria-required="true"
                  aria-invalid={!!(errors.confirmPassword && touched.confirmPassword)}
                  aria-describedby={errors.confirmPassword && touched.confirmPassword ? 'confirm-password-error' : undefined}
                  className={`w-full px-4 py-3 pr-12 bg-white/5 border rounded-xl text-white placeholder-gray-400 
                    focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-white/20 focus:ring-cyan-400'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white 
                    transition disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded p-1"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.5a10.528 10.528 0 01-2.05 3.772M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>
            <AnimatePresence mode="wait">
              {errors.confirmPassword && touched.confirmPassword && (
                <motion.p {...fadeIn} id="confirm-password-error" role="alert" className="mt-1.5 text-red-400 text-sm">
                  {errors.confirmPassword}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Institution Code (conditionally rendered) */}
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
                    Institution Code <span className="text-red-400" aria-label="required">*</span>
                  </label>
                  <motion.div
                    animate={institutionCodeStatus === 'invalid' ? 'shake' : ''}
                    variants={shakeAnimation}
                  >
                    <div className="relative">
                      <input
                        ref={instCodeRef}
                        id="institution-code"
                        type="text"
                        value={institutionCode}
                        onChange={(e) => setInstitutionCode(e.target.value)}
                        onBlur={() => handleBlur('institutionCode')}
                        placeholder="ABC123"
                        disabled={loading}
                        required
                        aria-invalid={institutionCodeStatus === 'invalid'}
                        aria-describedby={
                          institutionCodeStatus === 'invalid'
                            ? 'institution-code-error'
                            : institutionCodeStatus === 'valid'
                            ? 'institution-code-valid'
                            : undefined
                        }
                        className={`w-full px-4 py-3 pr-10 bg-white/5 border rounded-xl text-white placeholder-gray-400 
                          focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${
                            institutionCodeStatus === 'invalid'
                              ? 'border-red-500 focus:ring-red-500'
                              : institutionCodeStatus === 'valid'
                              ? 'border-green-500 focus:ring-green-500'
                              : 'border-white/20 focus:ring-cyan-400'
                          }`}
                      />

                      {/* Validation status icon */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {institutionCodeStatus === 'loading' && (
                          <svg
                            className="animate-spin h-5 w-5 text-cyan-400"
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
                        )}
                        {institutionCodeStatus === 'valid' && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5 text-green-500"
                          >
                            <path
                              fillRule="evenodd"
                              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {institutionCodeStatus === 'invalid' && institutionCodeError && (
                    <p id="institution-code-error" className="text-red-400 text-sm mt-1.5" aria-live="polite">
                      {institutionCodeError}
                    </p>
                  )}
                  {institutionCodeStatus === 'valid' && institutionName && (
                    <p id="institution-code-valid" className="text-green-400 text-sm mt-1.5 flex items-center gap-1" aria-live="polite">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                      </svg>
                      {institutionName} verified
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                Creating Account...
              </span>
            ) : (
              'Sign Up'
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/20" />
          <span className="px-3 text-gray-400 text-sm font-medium">OR</span>
          <div className="flex-grow h-px bg-white/20" />
        </div>

        {/* Google Signup */}
        <motion.button
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          onClick={handleGoogleSignup}
          disabled={loading}
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 border border-white/20 bg-white/5 
            text-white rounded-xl hover:bg-white/10 transition font-medium disabled:opacity-50 
            disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cyan-400"
        >
          <Image src="/google-icon.png" alt="" width={20} height={20} className="opacity-90" aria-hidden="true" />
          Sign up with Google
        </motion.button>

        {/* Footer */}
        <p className="text-center text-sm text-gray-300 mt-8">
          Already have an account?{' '}
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
