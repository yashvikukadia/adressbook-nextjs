import { NextResponse } from 'next/server';
const { getCurrentUser } = require('@/lib/auth');

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.set('access_token', '', { httpOnly: true, maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { httpOnly: true, maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
