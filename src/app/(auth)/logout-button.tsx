'use client';
import { useRouter } from 'next/navigation';

export default function LogoutButton(){
  const router = useRouter();
  const onLogout = async () => {
    await fetch('/api/session', { method: 'DELETE' });
    router.push('/login');
  };
  return <button onClick={onLogout} className="rounded-xl px-3 py-2 border">Logout</button>;
}
