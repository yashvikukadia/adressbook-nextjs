const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { cookies } = require('next/headers');
const { prisma } = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function createAccessToken(userId, email) {
  return jwt.sign(
    { sub: String(userId), email, type: 'access' },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM, expiresIn: '15m' }
  );
}

function createRefreshToken(userId) {
  return jwt.sign(
    { sub: String(userId), type: 'refresh' },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM, expiresIn: '7d' }
  );
}

function setAuthCookies(response, accessToken, refreshToken) {
  response.cookies.set('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 900,
    path: '/',
  });
  response.cookies.set('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 604800,
    path: '/',
  });
}

async function getCurrentUser(request) {
  const cookieStore = request.cookies || cookies();
  let token = cookieStore.get('access_token')?.value;

  if (!token) {
    const authHeader = request.headers.get('Authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    if (payload.type !== 'access') return null;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(payload.sub) },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (error) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  setAuthCookies,
  getCurrentUser,
};
