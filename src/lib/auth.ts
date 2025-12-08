import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { apiService } from './services/api';

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        totpCode: { label: '2FA Code', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // NextAuth serializes undefined to "undefined" string
          const totpCode = credentials.totpCode && credentials.totpCode !== 'undefined'
            ? credentials.totpCode
            : undefined;

          const response = await apiService.auth.login({
            email: credentials.email,
            password: credentials.password,
            // @ts-ignore
            totpCode: totpCode
          });

          // Handle 2FA requirement
          if (response.data.requiresTwoFactor) {
            throw new Error('2FA_REQUIRED');
          }

          // Fix: The API returns { success: true, data: { user, token } }
          // So we need to access response.data.data
          const { user, token } = response.data.data || response.data;

          if (!user || !token) {
            throw new Error('Invalid credentials');
          }

          // Return user with token
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            credits: user.credits,
            plan: user.plan,
            accessToken: token, // Store the JWT token
          };
        } catch (error: any) {
          console.error('Login error:', error);
          if (error.message === '2FA_REQUIRED') {
            throw error;
          }
          const errorMessage = error.response?.data?.error || error.message || 'Invalid credentials';
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.credits = user.credits;
        token.plan = user.plan;
        token.accessToken = user.accessToken; // Store backend JWT token
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        session.user.id = token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.credits = token.credits as number;
        session.user.plan = token.plan as string;
        session.user.accessToken = token.accessToken as string;

        // Fetch fresh credits on every session check to avoid stale data
        if (token.accessToken) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/profile`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token.accessToken}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
              },
              cache: 'no-store' // Ensure fresh data
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data?.credits !== undefined) {
                session.user.credits = data.data.credits; // Update with fresh credits
                token.credits = data.data.credits; // Also update token for next call
              }
            }
          } catch (error) {
            console.error('Failed to refresh credits in session:', error);
            // Keep cached credits if API call fails
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};

