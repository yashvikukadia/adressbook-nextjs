import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');
const { getCurrentUser } = require('@/lib/auth');

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const groups = await prisma.group.findMany({
      where: { userId: user.id },
      include: { _count: { select: { persons: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const result = groups.map((g) => ({
      id: g.id,
      name: g.name,
      person_count: g._count.persons,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ detail: 'Group name is required' }, { status: 400 });
    }

    const group = await prisma.group.create({
      data: { name, userId: user.id },
    });

    return NextResponse.json({ id: group.id, name: group.name, person_count: 0 });
  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
