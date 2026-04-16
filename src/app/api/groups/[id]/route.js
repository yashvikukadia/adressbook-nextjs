import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');
const { getCurrentUser } = require('@/lib/auth');

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const groupId = parseInt(id);

    const existing = await prisma.group.findFirst({
      where: { id: groupId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ detail: 'Group not found' }, { status: 404 });
    }

    const { name } = await request.json();
    const group = await prisma.group.update({
      where: { id: groupId },
      data: { name },
      include: { _count: { select: { persons: true } } },
    });

    return NextResponse.json({
      id: group.id,
      name: group.name,
      person_count: group._count.persons,
    });
  } catch (error) {
    console.error('Update group error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const groupId = parseInt(id);

    const existing = await prisma.group.findFirst({
      where: { id: groupId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ detail: 'Group not found' }, { status: 404 });
    }

    await prisma.group.delete({ where: { id: groupId } });
    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}
