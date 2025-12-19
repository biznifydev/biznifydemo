import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "@/styles/globals.css"
import { SideNav } from "@/components/layout/SideNav"
import { AuthProvider } from "@/components/providers/AuthProvider"
import { OrganizationProvider } from "@/components/providers/OrganizationProvider"
import { ConditionalLayout } from "@/components/layout/ConditionalLayout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Biznify",
  description: "A scalable business management platform",
  icons: {
    icon: "/images/logomark.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <OrganizationProvider>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 