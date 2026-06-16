import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Exported so server components can call getServerSession(authOptions)
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${process.env.STRAPI_URL}/api/auth/local`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();

          if (!data.jwt || !data.user) return null;

          const profileRes = await fetch(
            `${process.env.STRAPI_URL}/api/users/${data.user.id}?populate=*`,
            { headers: { Authorization: `Bearer ${data.jwt}` } }
          );
          const profile = await profileRes.json();

          if (profile.blocked === true) return null;

          return {
            id: data.user.id,
            name: data.user.username,
            email: data.user.email,
            jwt: data.jwt,
            role_type: profile.role_type || "investigator",
            allowed_tools: profile.allowed_tools || [],
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.jwt = user.jwt;
        token.name = user.name;
        token.email = user.email;
        token.id = user.id;
        token.role_type = user.role_type;
        token.allowed_tools = user.allowed_tools;
      }
      return token;
    },
    async session({ session, token }) {
      session.jwt = token.jwt;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.id = token.id;
      session.user.role_type = token.role_type;
      session.user.allowed_tools = token.allowed_tools;
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };