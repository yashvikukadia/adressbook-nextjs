import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(
      countries.map((c) => ({ id: c.id, name: c.name, code: c.code }))
    );
  } catch (error) {
    console.error('Get countries error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
