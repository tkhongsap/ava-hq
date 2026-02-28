import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Ava HQ",
  description: "Operations Dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Sidebar />
        <main className="md:ml-64 min-h-screen p-6 pt-16 md:pt-6">
          {children}
        </main>
      </body>
    </html>
  )
}
