'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            Tillbaka till översikten
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Om Sveriges Kommundata</h1>

          <div className="prose prose-amber max-w-none">
            <h2>Vad är detta?</h2>
            <p>
              Sveriges Kommundata är ett projekt som syftar till att göra det enklare att jämföra
              och utforska Sveriges kommuner. Genom att samla data från olika källor och presentera
              den på ett överskådligt sätt hoppas vi kunna hjälpa människor att fatta mer
              välgrundade beslut om var de vill bo och leva.
            </p>

            <h2>Datakällor</h2>
            <p>All data kommer från officiella källor:</p>
            <ul>
              <li>Befolkningsstatistik från SCB</li>
              <li>Brottsstatistik från Brå</li>
              <li>Skolresultat från Skolverket</li>
              <li>Arbetsmarknadsstatistik från Arbetsförmedlingen</li>
              <li>Bostadspriser från Hemnet/Booli</li>
            </ul>

            <h2>Uppdateringsfrekvens</h2>
            <p>
              Data uppdateras regelbundet från våra källor, men olika statistik har olika
              uppdateringsfrekvens:
            </p>
            <ul>
              <li>Befolkningsstatistik: Kvartalsvis</li>
              <li>Brottsstatistik: Månadsvis</li>
              <li>Skolresultat: Årligen</li>
              <li>Arbetsmarknadsstatistik: Månadsvis</li>
              <li>Bostadspriser: Veckovis</li>
            </ul>

            <h2>Metodik</h2>
            <p>
              Våra betyg och index baseras på följande faktorer:
            </p>
            <ul>
              <li>
                <strong>Säkerhetsbetyg (1-10):</strong> Baserat på anmälda brott per capita,
                uppklarningsgrad och medborgarundersökningar.
              </li>
              <li>
                <strong>Skolbetyg (1-10):</strong> Baserat på meritvärden, behörighet till
                gymnasium och högskolebehörighet.
              </li>
              <li>
                <strong>Bostadspriser:</strong> Genomsnittligt kvadratmeterpris baserat på
                faktiska försäljningar de senaste 12 månaderna.
              </li>
              <li>
                <strong>Sysselsättningsgrad:</strong> Andel av befolkningen i arbetsför ålder
                som är sysselsatta.
              </li>
            </ul>

            <h2>Kontakt & Feedback</h2>
            <p>
              Vi värdesätter dina synpunkter och förslag på förbättringar. Kontakta oss på:
            </p>
            <ul>
              <li>Email: kontakt@sverigeskommundata.se</li>
              <li>Twitter: @SverigesKommundata</li>
              <li>GitHub: github.com/sverigeskommundata</li>
            </ul>

            <h2>Teknisk Stack</h2>
            <p>
              Denna tjänst är byggd med moderna webbteknologier:
            </p>
            <ul>
              <li>Next.js 13 med App Router</li>
              <li>TypeScript för typsäker kod</li>
              <li>Tailwind CSS för styling</li>
              <li>Supabase för databas och API</li>
              <li>Radix UI för tillgängliga komponenter</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}