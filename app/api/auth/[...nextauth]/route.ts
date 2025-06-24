import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Email and password are required")
          }

          // First, authenticate the user
          const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          })

          const loginData = await loginResponse.json()

          if (!loginResponse.ok) {
            // Handle specific error messages from the backend
            throw new Error(loginData.detail || 'Authentication failed')
          }

          if (loginResponse.ok && loginData.access_token) {
            // Then, fetch user details using the access token
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${loginData.access_token}`,
                'Content-Type': 'application/json',
              },
            })

            if (!userResponse.ok) {
              const userData = await userResponse.json()
              throw new Error(userData.detail || 'Failed to fetch user details')
            }

            const userData = await userResponse.json()

            // Return user object with complete name information
            return {
              id: credentials.email,
              email: credentials.email,
              accessToken: loginData.access_token,
              name: userData.first_name,
              firstName: userData.first_name,
              lastName: userData.last_name,
              trialStartDate: userData.trial_start_date || new Date().toISOString(),
              isTrialExpired: userData.is_trial_expired || false,
              trial_status: userData.trial_status || 'active',
            }
          }

          throw new Error('Invalid credentials')
        } catch (error) {
          console.error('Auth error:', error)
          throw error // Propagate the error message
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/auth/error', // Add custom error page
  },
  callbacks: {
    async signIn({ user, account }: { user: any, account: any }) {
      if (account?.provider === 'google') {
        try {
          // Create or update user in your database
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              first_name: user.name?.split(' ')[0] || '',
              last_name: user.name?.split(' ').slice(1).join(' ') || '',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to authenticate with Google');
          }

          const data = await response.json();
          if (data.access_token) {
            user.accessToken = data.access_token;
            user.trialStartDate = data.trial_start_date || new Date().toISOString();
            user.isTrialExpired = data.is_trial_expired || false;
            user.trial_status = data.trial_status || 'active';
          }
        } catch (error) {
          console.error('Error storing Google user:', error);
          throw error; // Propagate the error message
        }
      }
      return true;
    },
    async jwt({ token, user }: { token: any, user: any }) {
      if (user && 'accessToken' in user) {
        token.accessToken = user.accessToken
      }
      if (user) {
        token.name = user.name
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.trialStartDate = user.trialStartDate
        token.isTrialExpired = user.isTrialExpired
        token.trial_status = user.trial_status
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
      if (token) {
        session.user = {
          name: `${token.name} ${token.lastName || ''}`.trim(),
          email: session.user?.email,
          image: session.user?.image,
          accessToken: token.accessToken,
          firstName: token.firstName,
          lastName: token.lastName,
          trialStartDate: token.trialStartDate,
          isTrialExpired: token.isTrialExpired,
          trial_status: token.trial_status
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
