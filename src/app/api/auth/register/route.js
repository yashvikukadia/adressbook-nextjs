import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');
const { hashPassword, createAccessToken, createRefreshToken, setAuthCookies } = require('@/lib/auth');

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ detail: 'Name, email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name,
        role: 'user',
      },
    });

    const accessToken = createAccessToken(user.id, user.email);
    const refreshToken = createRefreshToken(user.id);

    const response = NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setAuthCookies(response, accessToken, refreshToken);
    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
