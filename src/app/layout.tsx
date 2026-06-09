import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/Providers"
import { Header } from "@/components/Header"
import { Toaster } from "sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "CineVault — Discover, Review & Share Movies & TV Shows",
  description: "Your premium movie and TV show platform with social features, reviews, and watchlists",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body
        className="min-h-full flex flex-col text-white"
        style={{ background: '#0B0F19' }}
      >
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: 'oklch(0.14 0.020 262)',
                border: '1px solid oklch(0.22 0.025 262)',
                color: 'white',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
