// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import {
  isValidEmail,
  sanitizeDisplayName,
  isValidDisplayName,
  isValidPassword,
  isValidRole
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    // Verify session and check admin role
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const { data: userProfile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single<{ role: string }>();

    if (!userProfile || userProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, data } = body;

    const adminSupabase = createAdminClient();

    switch (action) {
      case 'create': {
        // SECURITY: Validate all input fields
        if (!isValidEmail(data.email)) {
          return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
        }

        const sanitizedName = sanitizeDisplayName(data.displayName);
        if (!isValidDisplayName(sanitizedName)) {
          return NextResponse.json({ error: 'Display name must be 2-100 characters' }, { status: 400 });
        }

        if (!isValidRole(data.role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        // Validate password if provided
        const password = data.password || 'TempPassword123!';
        if (!isValidPassword(password)) {
          return NextResponse.json({
            error: 'Password must be 8+ characters with uppercase, lowercase, and number'
          }, { status: 400 });
        }

        // Create Supabase Auth user
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
          email: data.email,
          password: password,
          email_confirm: false, // Admin creates unverified users
          user_metadata: {
            display_name: sanitizedName,
            role: data.role || 'student',
          },
        });

        if (authError || !authData.user) {
          logger.error('Failed to create auth user:', authError);
          throw authError;
        }

        // Create user profile (database trigger should handle this, but we'll do it manually for control)
        const { error: profileError } = await adminSupabase
          .from('users')
          // @ts-ignore - Type inference issue with Supabase admin client
          .insert([{
            id: authData.user.id,
            email: data.email,
            display_name: sanitizedName,
            role: data.role || 'student',
            xp: 0,
            level: 1,
            streak: 0,
            institution_id: data.institutionId || null,
            account_type: data.accountType || 'individual',
          }]);

        if (profileError) {
          logger.error('Failed to create user profile:', profileError);
          // Clean up auth user if profile creation fails
          await adminSupabase.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }

        logger.log('User created:', authData.user.id);
        return NextResponse.json({ success: true, userId: authData.user.id });
      }

      case 'resetPassword': {
        const { error: resetError } = await adminSupabase.auth.admin.updateUserById(
          data.userId,
          { password: data.newPassword }
        );

        if (resetError) throw resetError;

        logger.log('Password reset for user:', data.userId);
        return NextResponse.json({ success: true });
      }

      case 'deleteAuth': {
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(data.userId);

        if (deleteError) throw deleteError;

        logger.log('Auth user deleted:', data.userId);
        return NextResponse.json({ success: true });
      }

      case 'bulkCreate': {
        const results = [];

        for (const user of data.users) {
          try {
            // Create Auth user
            const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
              email: user.email,
              password: user.password || 'TempPassword123!',
              email_confirm: false,
              user_metadata: {
                display_name: user.displayName,
                role: user.role || 'student',
              },
            });

            if (authError || !authData.user) {
              throw authError || new Error('Failed to create auth user');
            }

            // Create user profile
            const { error: profileError } = await adminSupabase
              .from('users')
              // @ts-ignore - Type inference issue with Supabase admin client
              .insert([{
                id: authData.user.id,
                email: user.email,
                display_name: user.displayName,
                role: user.role || 'student',
                xp: 0,
                level: 1,
                streak: 0,
                institution_id: user.institutionId || null,
                account_type: user.accountType || 'individual',
              }]);

            if (profileError) {
              // Clean up auth user if profile creation fails
              await adminSupabase.auth.admin.deleteUser(authData.user.id);
              throw profileError;
            }

            results.push({ success: true, email: user.email, uid: authData.user.id });
          } catch (error) {
            results.push({
              success: false,
              email: user.email,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }

        logger.log(`Bulk created ${results.filter((r) => r.success).length} users`);
        return NextResponse.json({ success: true, results });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
