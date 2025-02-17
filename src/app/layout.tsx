import type React from "react"
import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import Image from "next/image"
import "./globals.css"

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "YaanAI",
  description: "Learn. Play. Grow."
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className}`}>
      <nav className="bg-[#a3e7e6] shadow-md p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Image
                src="/yaanailogo.png"
                alt="YaanAI Logo"
                width={90}
                height={90}
                className="rounded-full"
              />
            </div>
            <button className="bg-black text-white px-4 py-2 rounded-full font-semibold hover:bg-[#80d3d0] transition-colors">
              Login
            </button>
          </div>
        </nav>

        {children}
        <footer className="bg-[#b2f0ef] text-[#2c3e50] p-4 text-center shadow-md">
          <p className="text-sm">
            Created by Gayathri J and Yeshaswi Prakash. Team Keroppi & Purin. Vertex Innovate Hackathon
          </p>
        </footer>
      </body>
    </html>
  )
}
