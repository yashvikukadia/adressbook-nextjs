# Address Book - Next.js Full Stack Application

A full-stack address book web application built with **Next.js**, **Prisma ORM**, **PostgreSQL**, and **Tailwind CSS**.

## Tech Stack

- **Frontend & Backend**: Next.js 14 (App Router)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS
- **Auth**: JWT (httpOnly cookies)
- **File Upload**: Local file storage

## Database Schema (Prisma)

```
Person (name, email, phone)
  -> Address (street, city, state) -> Country (name, code)
  -> Profile (profilePic, website)
  -> Groups (many-to-many)
User (email, password, name, role)
```

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- PostgreSQL installed and running
- A PostgreSQL database created (e.g., `addressbook`)

### 2. Clone and Install Dependencies

```bash
cd nextjs-addressbook
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/addressbook"
JWT_SECRET="your-secret-key-change-this-in-production"
ADMIN_EMAIL="admin@addressbook.com"
ADMIN_PASSWORD="admin123"
```

Replace `your_password` with your PostgreSQL password.

### 4. Setup Database

Run Prisma migration to create the tables:

```bash
npx prisma migrate dev --name init
```

Or push schema directly:

```bash
npx prisma db push
```

### 5. Seed the Database

This creates the admin user and initial country data:

```bash
node prisma/seed.js
```

### 6. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 7. Login

Use the admin credentials:
- **Email**: admin@addressbook.com
- **Password**: admin123

Or register a new account.

## Features

- **User Authentication** - Register/Login with JWT tokens
- **Contact Management** - Add, edit, delete contacts
- **Detailed Information** - Name, email, phone, address, website, profile picture
- **Groups/Categories** - Create groups and assign contacts
- **Search & Filter** - Search by name, email, phone; filter by groups
- **Profile Pictures** - Upload profile photos for contacts
- **Responsive Design** - Works on desktop and mobile
- **Neo-Brutalist UI** - Colorful, vibrant, modern minimal design

## Prisma Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Push schema changes
npx prisma db push

# Open Prisma Studio (GUI)
npx prisma studio

# Seed database
node prisma/seed.js
```

## Project Structure

```
nextjs-addressbook/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Seed script
├── public/
│   └── uploads/           # Uploaded profile pictures
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── auth/      # Auth endpoints
│   │   │   ├── persons/   # Contact CRUD
│   │   │   ├── groups/    # Group CRUD
│   │   │   ├── countries/ # Countries list
│   │   │   └── upload/    # File upload
│   │   ├── login/         # Login page
│   │   ├── register/      # Register page
│   │   ├── dashboard/     # Main dashboard
│   │   ├── layout.js      # Root layout
│   │   ├── page.js        # Home redirect
│   │   └── globals.css    # Global styles
│   └── lib/
│       ├── prisma.js      # Prisma client singleton
│       └── auth.js        # Auth utilities
├── .env                   # Environment variables
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```
