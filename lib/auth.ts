import NextAuth, { type DefaultSession } from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db/client";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
  type User as DbUser,
} from "@/lib/db/schema";
import { sendMagicLinkEmail } from "@/lib/email";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: DbUser["role"];
    };
  }
  interface User {
    role?: DbUser["role"];
  }
}

const adapter = DrizzleAdapter(db, {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  providers: [
    Resend({
      from: process.env.RESEND_FROM ?? "ImmoHero <team@immohero.org>",
      apiKey: process.env.RESEND_API_KEY,
      async sendVerificationRequest({ identifier: email, url }) {
        await sendMagicLinkEmail({ to: email, url });
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as DbUser).role ?? "customer";
      return session;
    },
  },
  trustHost: true,
});

export async function requireRole(allowed: DbUser["role"][]) {
  const session = await auth();
  if (!session?.user?.role || !allowed.includes(session.user.role)) {
    return null;
  }
  return session;
}
