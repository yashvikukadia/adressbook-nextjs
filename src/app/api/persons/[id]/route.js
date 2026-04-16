import { NextResponse } from 'next/server';
const { prisma } = require('@/lib/prisma');
const { getCurrentUser } = require('@/lib/auth');

export async function GET(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const person = await prisma.person.findFirst({
      where: { id: parseInt(id), userId: user.id },
      include: {
        address: { include: { country: true } },
        profile: true,
        groups: true,
      },
    });

    if (!person) {
      return NextResponse.json({ detail: 'Person not found' }, { status: 404 });
    }

    return NextResponse.json(formatPersonResponse(person));
  } catch (error) {
    console.error('Get person error:', error);
    return NextResponse.json({ detail: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const personId = parseInt(id);

    const existing = await prisma.person.findFirst({
      where: { id: personId, userId: user.id },
      include: { address: true, profile: true },
    });

    if (!existing) {
      return NextResponse.json({ detail: 'Person not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, email, phone, address, profile, group_ids } = body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;

    // Handle address
    if (address) {
      if (existing.address) {
        updateData.address = {
          update: {
            street: address.street,
            city: address.city,
            state: address.state || '',
            countryId: parseInt(address.country_id),
          },
        };
      } else if (address.street && address.city && address.country_id) {
        updateData.address = {
          create: {
            street: address.street,
            city: address.city,
            state: address.state || '',
            countryId: parseInt(address.country_id),
          },
        };
      }
    }

    // Handle profile
    if (profile) {
      if (existing.profile) {
        const profileUpdate = {};
        if (profile.profile_pic !== undefined) profileUpdate.profilePic = profile.profile_pic;
        if (profile.website !== undefined) profileUpdate.website = profile.website;
        updateData.profile = { update: profileUpdate };
      } else {
        updateData.profile = {
          create: {
            profilePic: profile.profile_pic || null,
            website: profile.website || null,
          },
        };
      }
    }

    // Handle groups
    if (group_ids !== undefined) {
      updateData.groups = {
        set: group_ids.map((gid) => ({ id: parseInt(gid) })),
      };
    }

    const person = await prisma.person.update({
      where: { id: personId },
      data: updateData,
      include: {
        address: { include: { country: true } },
        profile: true,
        groups: true,
      },
    });

    return NextResponse.json(formatPersonResponse(person));
  } catch (error) {
    console.error('Update person error:', error);
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
    const personId = parseInt(id);

    const existing = await prisma.person.findFirst({
      where: { id: personId, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ detail: 'Person not found' }, { status: 404 });
    }

    await prisma.person.delete({ where: { id: personId } });
    return NextResponse.json({ message: 'Person deleted successfully' });
  } catch (error) {
    console.error('Delete person error:', error);
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
