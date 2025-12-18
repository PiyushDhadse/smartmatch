# SmartMatch

A Next.js service marketplace platform with Express backend integration.

## Project Structure

- **Frontend**: Next.js 16 (App Router)
- **Backend**: Express.js API (located in `/backend`)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js with GitHub OAuth

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- GitHub OAuth app credentials

### Environment Setup

1. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

2. Required environment variables:
   - `GITHUB_CLIENT_ID` - GitHub OAuth app client ID
   - `GITHUB_CLIENT_SECRET` - GitHub OAuth app client secret
   - `NEXTAUTH_URL` - Your frontend URL (http://localhost:3000 in dev)
   - `NEXT_PUBLIC_API_URL` - Backend API URL (http://localhost:5000/api in dev)
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key

### Running the Application

**Start the backend server** (in a separate terminal):

```bash
cd backend
npm install
npm start
```

The backend API will run on http://localhost:5000

**Start the frontend development server**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app will be available at [http://localhost:3000](http://localhost:3000).

## API Integration

The frontend integrates with the Express backend API using the centralized API client located at `app/lib/api.ts`.

### Features

- **User Sync**: Automatically syncs authenticated users from NextAuth to Supabase on login
- **Service Management**: Fetches services from the backend with filtering, search, and pagination
- **Booking Management**: Create and manage service bookings
- **Provider Dashboard**: Providers can manage their services and view booking stats

### API Endpoints Used

- `POST /api/auth/sync-user` - Sync user data with database
- `GET /api/services` - Fetch all services with filters
- `GET /api/services/:id` - Get service details
- `POST /api/services` - Create a new service (Provider only)
- `PUT /api/services/:id` - Update service (Provider only)
- `DELETE /api/services/:id` - Delete service (Provider only)
- `POST /api/bookings` - Create a booking
- `GET /api/bookings/my-bookings` - Get user's bookings
- `GET /api/bookings/provider-bookings` - Get provider's bookings

### Using the API Client

```javascript
import { getServices, createBooking } from '@/app/lib/api';

// Fetch services with filters
const response = await getServices({
  category: 'home',
  search: 'plumbing',
  page: 1,
  limit: 10
});

// Create a booking (requires auth token)
const booking = await createBooking(token, {
  service_id: 'service-uuid',
  scheduled_date: '2024-12-20T10:00:00Z',
  notes: 'Please bring tools'
});
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
