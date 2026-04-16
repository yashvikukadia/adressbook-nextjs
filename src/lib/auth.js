const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // changed
const { cookies } = require('next/headers');
const { prisma } = require('./prisma');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = 'HS256';

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function verifyPassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

function createAccessToken(userId, email) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing"); // added safety

  return jwt.sign(
    { sub: String(userId), email, type: 'access' },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM, expiresIn: '15m' }
  );
}

function createRefreshToken(userId) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET missing");

  return jwt.sign(
    { sub: String(userId), type: 'refresh' },
    JWT_SECRET,
    { algorithm: JWT_ALGORITHM, expiresIn: '7d' }
  );
}