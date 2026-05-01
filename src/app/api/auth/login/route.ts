import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// ─── Hardcoded credentials for hackathon demo ───────────────────────────────
// Admin: sipalingnanda@gmail.com / dickyganteng77 → redirect to admin dashboard
// Any other valid-looking email+password → regular user
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'sipalingnanda@gmail.com';
const ADMIN_PASSWORD = 'dickyganteng77';

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
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        role: 'admin',
        redirect: '/admin',
      });
    }

    // Any other credentials → regular user (for demo, accept anything)
    if (password.length >= 4) {
      return NextResponse.json({
        success: true,
        role: 'user',
        redirect: '/',
      });
    }

    return NextResponse.json(
      { error: 'Password minimal 4 karakter' },
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
