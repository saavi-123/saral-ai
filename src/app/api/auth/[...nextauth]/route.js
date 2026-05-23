import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
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

          if (data.jwt && data.user) {
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              jwt: data.jwt,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On first sign in, user object is available — persist jwt into token
      if (user) {
        token.jwt = user.jwt;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose jwt and name to the session object
      session.jwt = token.jwt;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },

  pages: {
    signIn: "/login", // redirect to our custom login page
  },

  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };