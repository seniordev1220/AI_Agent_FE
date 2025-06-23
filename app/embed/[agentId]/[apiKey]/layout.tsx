import { Metadata } from 'next'
import { Public_Sans } from "next/font/google"

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-public-sans',
})

export const metadata: Metadata = {
  title: "Finiite AI Chat",
  description: "Chat with AI Agent",
}

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body suppressHydrationWarning>
        <div className={`${publicSans.variable} min-h-screen bg-white`}>
          {children}
        </div>
      </body>
    </html>
  )
} 
