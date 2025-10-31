import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Svenska Kommuner - Statistik & Jämförelser',
  description: 'Jämför säkerhet, skolbetyg, bostadspriser och mer för Sveriges 290 kommuner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv">
      <body className={inter.className}>
        {children}
        <footer className="bg-gray-800 text-white p-8 mt-12">
          <div className="container mx-auto text-center">
            <p className="mb-2">© 2024 Svenska Kommuner Dashboard</p>
            <p className="text-sm text-gray-400">
              Data från SCB och andra öppna källor | Skapad av{' '}
              <a
                href="https://twitter.com/DisturbingEU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                @DisturbingEU
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
