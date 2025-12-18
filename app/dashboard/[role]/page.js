// app/dashboard/[role]/page.js
'use client';

import { useParams, redirect } from 'next/navigation';
import UserDashboard from './UserDashboard';
import ProviderDashboard from './ProviderDashboard';

export default function DashboardPage() {
  const params = useParams();
  const role = params.role;

  // Validate role
  if (role !== 'user' && role !== 'provider') {
    redirect('/login');
  }

  return role === 'provider' ? <ProviderDashboard /> : <UserDashboard />;
}