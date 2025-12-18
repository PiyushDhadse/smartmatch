import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

const handler = NextAuth({
  // Explicitly set base URL to Vercel domain
  // This ensures all auth routes (/api/auth/*) are on Vercel, not Render
  // NEXTAUTH_URL should be set in Vercel env vars (e.g., https://smartmatch-phi.vercel.app)
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
      // Explicitly set authorization URL to ensure correct redirect
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Sync user with backend database on Render (using NEXT_PUBLIC_API_URL)
      // This is the ONLY place we call Render backend - all auth happens on Vercel
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
        const response = await fetch(`${apiUrl}/auth/sync-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
          }),
        });

        if (!response.ok) {
          console.error("Failed to sync user with backend");
          // Allow sign in even if sync fails
        }
      } catch (error) {
        console.error("Error syncing user:", error);
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
