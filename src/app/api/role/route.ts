// src/app/api/role/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

// Mark this route as dynamic (not statically generated during build)
export const dynamic = 'force-dynamic';

// Read role
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ role: 'guest' });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    return NextResponse.json({
      role: profile?.role ?? 'student',
      user: { uid: user.id, id: user.id, email: user.email }
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ role: 'guest', error: errorMessage });
  }
}

// Set role (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch caller's role
    const { data: callerProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    const callerRole = callerProfile?.role ?? 'student';

    // Both 'admin' and 'dev' roles have permission to set user roles
    if (callerRole !== 'admin' && callerRole !== 'dev') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { uid, role } = await request.json();
    if (!uid || !role) return NextResponse.json({ error: 'uid and role required' }, { status: 400 });

    // Update Supabase users table
    const adminSupabase = createAdminClient();
    const { error: updateError } = await (adminSupabase
      .from('users') as any)
      .update({ role, updated_at: new Date().toISOString() })
      .eq('id', uid);

    if (updateError) throw updateError;

    // Also sync role into user metadata
    const { error: metadataError } = await adminSupabase.auth.admin.updateUserById(
      uid,
      { user_metadata: { role } }
    );

    if (metadataError) throw metadataError;

    return NextResponse.json({ ok: true });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
