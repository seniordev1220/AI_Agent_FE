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
            return null
          }

          // First, authenticate the user
          const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              username: credentials.email,
              password: credentials.password,
            }),
          })

          const loginData = await loginResponse.json()

          if (loginResponse.ok && loginData.access_token) {
            // Then, fetch user details using the access token
            const userResponse = await fetch(`${process.env.NEXT_PUBLIC_NEXTAUTH_URL}/users/me`, {
              headers: {
                'Authorization': `Bearer ${loginData.access_token}`,
                'Content-Type': 'application/json',
              },
            })

            const userData = await userResponse.json()

            // Return user object with complete name information
            return {
              id: credentials.email,
              email: credentials.email,
              accessToken: loginData.access_token,
              name: userData.first_name,
              firstName: userData.first_name,
              lastName: userData.last_name,
            }
          }

          return null
        } catch (error) {
          console.error('Auth error:', error)
          return null
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
  },
  callbacks: {
    async jwt({ token, user }: { token: any, user: any }) {
      if (user && 'accessToken' in user) {
        token.accessToken = user.accessToken
      }
      if (user) {
        token.name = user.name
        token.firstName = user.firstName
        token.lastName = user.lastName
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
          lastName: token.lastName
        }
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
