import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'
import { NextAuthOptions } from 'next-auth'

// Configuration options for NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: { scope: 'identify' }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Add access token from Discord to the token
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Add the access token to the session
      // @ts-expect-error - We know this field exists but TypeScript doesn't
      session.accessToken = token.accessToken as string | undefined
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle redirects after auth
      return url.startsWith(baseUrl) ? url : baseUrl
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
}

export default NextAuth(authOptions)