import { NextResponse } from 'next/server';
const jwt = require('jsonwebtoken');
const { prisma } = require('@/lib/prisma');
const { createAccessToken, setAuthCookies } = require('@/lib/auth');

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json({ detail: 'No refresh token' }, { status: 401 });
    }

    const payload = jwt.verify(refreshToken, JWT_SECRET, { algorithms: ['HS256'] });
    if (payload.type !== 'refresh') {
      return NextResponse.json({ detail: 'Invalid token type' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.sub) },
    });

    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 401 });
    }

    const accessToken = createAccessToken(user.id, user.email);

    const response = NextResponse.json({ message: 'Token refreshed' });
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ detail: 'Invalid refresh token' }, { status: 401 });
  }
}
