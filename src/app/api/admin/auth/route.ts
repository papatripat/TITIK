import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple admin authentication using environment variable
// In production, use a proper auth system like NextAuth.js
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'titik-admin-2026';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password diperlukan' },
        { status: 400 }
      );
    }

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Password salah' },
        { status: 401 }
      );
    }

    // Return a simple token (in production, use JWT)
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
