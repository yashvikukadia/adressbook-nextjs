import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');
const { getCurrentUser } = require('@/lib/auth');

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const groupId = searchParams.get('group_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const where = { userId: user.id };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (groupId) {
      where.groups = { some: { id: parseInt(groupId) } };
    }

    const [persons, totalCount] = await Promise.all([
      prisma.person.findMany({
        where,
        include: {
          address: { include: { country: true } },
          profile: true,
          groups: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.person.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: persons.map(formatPersonResponse),
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Get persons error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, profile, group_ids } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ detail: 'Name, email, and phone are required' }, { status: 400 });
    }

    const personData = {
      name,
      email,
      phone,
      userId: user.id,
    };

    if (address && address.street && address.city && address.country_id) {
      personData.address = {
        create: {
          street: address.street,
          city: address.city,
          state: address.state || '',
          countryId: parseInt(address.country_id),
        },
      };
    }

    if (profile) {
      personData.profile = {
        create: {
          profilePic: profile.profile_pic || null,
          website: profile.website || null,
        },
      };
    }

    if (group_ids && group_ids.length > 0) {
      personData.groups = {
        connect: group_ids.map((id) => ({ id: parseInt(id) })),
      };
    }

    const person = await prisma.person.create({
      data: personData,
      include: {
        address: { include: { country: true } },
        profile: true,
        groups: true,
      },
    });

    return NextResponse.json(formatPersonResponse(person));
  } catch (error) {
    console.error('Create person error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

function formatPersonResponse(person) {
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    phone: person.phone,
    address: person.address
      ? {
          id: person.address.id,
          street: person.address.street,
          city: person.address.city,
          state: person.address.state,
          country: person.address.country
            ? {
                id: person.address.country.id,
                name: person.address.country.name,
                code: person.address.country.code,
              }
            : null,
        }
      : null,
    profile: person.profile
      ? {
          id: person.profile.id,
          profile_pic: person.profile.profilePic,
          website: person.profile.website,
        }
      : null,
    groups: person.groups.map((g) => ({ id: g.id, name: g.name })),
  };
}
