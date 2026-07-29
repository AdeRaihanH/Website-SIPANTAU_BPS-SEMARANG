import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email dan password baru wajib diisi.' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If service role key is available, update password directly in Supabase Auth via Admin API
    if (serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Find user profile by email
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Akun dengan email tersebut tidak ditemukan.' }, { status: 404 });
      }

      // Update password in Supabase Auth
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
        password: password
      });

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: 'Password berhasil diperbarui di Supabase.' });
    } else {
      // Without service role key, we notify client to rely on Supabase recovery session or client updateUser
      return NextResponse.json({ 
        success: true, 
        message: 'Password diperbarui di lokal. Tambahkan SUPABASE_SERVICE_ROLE_KEY di .env.local untuk memperbarui password auth secara langsung.' 
      });
    }
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
