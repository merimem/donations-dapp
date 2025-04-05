"use client"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/utils/Providers"
import { UserContext } from "@/components/context/UserContext"
import Navbar from "@/components/navbar/Navbar"
import Footer from "@/components/footer/Footer"
import { useState } from "react"
import { UserType } from "@/modules/users/users.typedefs"
import "@rainbow-me/rainbowkit/styles.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [userType, setUserType] = useState<UserType | null>(null)
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-base-300">
        <Providers>
          <UserContext.Provider
            value={{
              userType,
              setUserType,
            }}
          >
            <Navbar />
            <div className="mx-6 mt-4">{children}</div>

            <Footer />
          </UserContext.Provider>
        </Providers>
      </body>
    </html>
  )
}
