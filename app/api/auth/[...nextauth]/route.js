import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sync user with backend database on sign in
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/auth/sync-user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync user with backend');
          // Allow sign in even if sync fails
        }
      } catch (error) {
        console.error('Error syncing user:', error);
        // Allow sign in even if sync fails
      }
      return true;
    },
    async session({ session, token }) {
      // Attach user ID from token to session
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
