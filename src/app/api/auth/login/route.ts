import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ─── Hardcoded credentials for hackathon demo ───────────────────────────────
// Admin: sipalingnanda@gmail.com / dickyganteng77 → redirect to admin dashboard
// Any other valid-looking email+password → regular user
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_CREDENTIALS = [
  { email: 'sipalingnanda@gmail.com', password: 'dickyganteng77' },
  { email: 'admintitik@gmail.com', password: 'akuadmin123' }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password diperlukan' },
        { status: 400 }
      );
    }

    // Check if admin credentials
    const isAdmin = ADMIN_CREDENTIALS.some(
      (cred) => cred.email === email && cred.password === password
    );

    if (isAdmin) {
      return NextResponse.json({
        success: true,
        role: 'admin',
        redirect: '/admin',
      });
    }

    // Not admin → return 401 so /signin falls through to Supabase Auth
    return NextResponse.json(
      { error: 'Bukan admin' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
