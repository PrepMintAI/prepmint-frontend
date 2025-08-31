// src/app/signup/page.tsx
'use client';
import { useState } from 'react';
import { auth, db } from '@/lib/firebase.client';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp  } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from "next/image";

async function createSession(idToken: string) {
  await fetch('/api/session', { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json' }, 
    body: JSON.stringify({ idToken }) 
  });
}

export default function SignupPage() {
  const [mode, setMode] = useState<'individual' | 'institution'>('individual');
  const [institutionCode, setInstitutionCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSignup = async (e: any) => {
  e.preventDefault();
  setLoading(true); setError(null);

  try {
    if (mode === 'institution') {
      const instSnap = await getDoc(doc(db, 'institutions', institutionCode.trim()));
      if (!instSnap.exists()) throw new Error('Invalid institution code');
    }

    if (password.length < 8) throw new Error('Password must be at least 8 characters long');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    // Force token refresh before Firestore write
    await cred.user.getIdToken(true);

    await setDoc(doc(db, 'users', cred.user.uid), {
      name,
      email,
      role: 'student',
      institutionCode: mode === 'institution' ? institutionCode : null,
      createdAt: Timestamp.now()
    });

    const idToken = await cred.user.getIdToken();
    await createSession(idToken);

    router.push('/dashboard/student');
  } catch (e: any) {
    setError(e?.message ?? 'Signup failed');
  } finally {
    setLoading(false);
  }
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
        <h1 className="text-3xl font-bold text-center text-white">
          Create your account
        </h1>
        <p className="text-sm text-gray-300 text-center mb-6">
          Join us and start your journey 🚀
        </p>

        {/* Toggle buttons */}
        <div className="flex space-x-2 mb-6">
          <button 
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode==='individual' 
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            onClick={()=>setMode('individual')}
          >
            Individual
          </button>
          <button 
            type="button"
            className={`flex-1 py-2 rounded-lg font-medium transition ${
              mode==='institution' 
                ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-black' 
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            onClick={()=>setMode('institution')}
          >
            Institution
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSignup} className="space-y-4">
          <input 
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Full name" 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required 
          />
          <input 
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Email" 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
          />
          <input 
            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            placeholder="Password (min 8 chars)" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required 
          />
          {mode === 'institution' && (
            <input 
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              placeholder="Institution Code" 
              value={institutionCode} 
              onChange={e=>setInstitutionCode(e.target.value)} 
              required 
            />
          )}

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button 
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold rounded-xl hover:opacity-90 transition"
          >
            {loading ? 'Creating...' : 'Sign Up'}
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
