import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
   providers: [
     Credentials({
       credentials: {
         email: { label: "Email", type: "email" },
         password: { label: "Password", type: "password" },
       },
       authorize: async (credentials) => {
         if (!credentials?.email || !credentials?.password) {
           return null;
         }

         // Lazy load Prisma to avoid initialization during build
         const { prisma } = await import("./prisma");

         const user = await prisma.user.findUnique({
           where: { email: credentials.email as string },
         });

         if (!user) {
           return null;
         }

         const isPasswordValid = await bcrypt.compare(
           credentials.password as string,
           user.password
         );

         if (!isPasswordValid) {
           return null;
         }

         return {
           id: user.id,
           email: user.email,
           name: user.name,
         };
       },
     }),
   ],
   session: {
     strategy: "jwt" as const,
   },
   pages: {
     signIn: "/login",
   },
   callbacks: {
     async jwt({ token, user }: any) {
       if (user) {
         token.id = user.id;
       }
       return token;
     },
     async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
   },
   secret: process.env.NEXTAUTH_SECRET,
 };

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
export default handler;
