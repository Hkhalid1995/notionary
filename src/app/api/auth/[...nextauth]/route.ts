import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

// Extend the session type to include user id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      }
    })
  ],
  session: {
    strategy: "database" as const,
  },
  callbacks: {
    async session({ session, user }: any) {
      if (user && session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google") {
        try {
          // Ensure user exists in database
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { workspaces: true }
          });

          if (existingUser && existingUser.workspaces.length === 0) {
            // Create default workspace for new Google users
            await prisma.workspace.create({
              data: {
                name: "My Workspace",
                description: "Default workspace",
                color: "#4F46E5",
                isDefault: true,
                userId: existingUser.id
              }
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }
      return true;
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 