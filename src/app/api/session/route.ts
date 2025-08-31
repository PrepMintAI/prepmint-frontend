// src/app/api/session/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase.admin';

const SESSION_COOKIE_NAME = '__session'; // works with Firebase Hosting/Vercel

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });

    const expiresIn = 1000 * 60 * 60 * 24 * 5; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const res = NextResponse.json({ ok: true });
    res.headers.set('Set-Cookie', `${SESSION_COOKIE_NAME}=${sessionCookie}; HttpOnly; Secure; Path=/; Max-Age=${expiresIn/1000}; SameSite=Lax`);
    return res;
  } catch (e:any) {
    return NextResponse.json({ error: e?.message ?? 'Failed to create session' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax`);
  return res;
}
