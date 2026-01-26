export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-4xl font-bold text-red-600">403 - Unauthorized</h1>
      <p className="mt-2 text-gray-600">You don&apos;t have permission to access this page.</p>
      <a href="/login" className="mt-4 text-emerald-600 underline">Return to Login</a>
    </div>
  );
}