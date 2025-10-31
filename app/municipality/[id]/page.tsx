'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface Municipality {
  id: string
  name: string
  county?: string
  population: number
  safety_score?: number | null
  school_rating?: number | null
  price_per_sqm?: number | null
  employment_rate?: number | null
  utrikes_fodda?: number | null
  tva_utrikes_foraldrar?: number | null
  en_utrikes_foraldrar?: number | null
  tva_inrikes_foraldrar?: number | null
  utlandsk_bakgrund_total?: number | null
  procent_utlandsk_bakgrund?: number | null
  top_fodelselander?: string | null
}

interface BirthCountry {
  country: string
  count: number
}

export default function MunicipalityDetail() {
  const params = useParams()
  const [municipality, setMunicipality] = useState<Municipality | null>(null)
  const [loading, setLoading] = useState(true)
  const [birthCountries, setBirthCountries] = useState<BirthCountry[]>([])

  useEffect(() => {
    if (params.id) {
      fetch(`/api/municipalities/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setMunicipality(data)

          // Parse birth countries data from pipe-separated format
          if (data.top_fodelselander) {
            try {
              // Parse pipe-separated format: "Sverige: 16298 | Finland: 548 | ..."
              const pairs = data.top_fodelselander.split('|').map((s: string) => s.trim())
              const filtered = pairs
                .map((pair: string) => {
                  const [country, countStr] = pair.split(':').map((s: string) => s.trim())
                  return { country, count: parseInt(countStr) }
                })
                .filter(({ country }: { country: string }) => country.toLowerCase() !== 'sverige')
                .sort((a: { count: number }, b: { count: number }) => b.count - a.count)
              setBirthCountries(filtered)
            } catch (e) {
              console.error('Error parsing birth countries:', e)
            }
          }

          setLoading(false)
        })
        .catch((error) => {
          console.error('Error fetching municipality:', error)
          setLoading(false)
        })
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex justify-center items-center">
        <div className="text-2xl font-bold text-gray-700">Laddar kommun...</div>
      </div>
    )
  }

  if (!municipality) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Kommun hittades inte</h1>
            <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold">
              ← Tillbaka till startsidan
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <main className="container mx-auto px-6 py-12">
        <div className="mb-6">
          <Link href="/" className="text-amber-600 hover:text-amber-700 font-semibold text-lg">
            ← Tillbaka till alla kommuner
          </Link>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-100">
          <h1 className="text-4xl font-bold mb-2 text-gray-800">{municipality.name}</h1>
          {municipality.county && (
            <p className="text-xl text-gray-600 mb-4">{municipality.county}</p>
          )}
          <div className="flex items-center gap-2 text-lg text-gray-700">
            <span className="text-2xl">👥</span>
            <span className="font-semibold">{municipality.population?.toLocaleString('sv-SE')} invånare</span>
          </div>
        </div>

        {/* Main Statistics - Matching Chart Section Style */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Statistik & Nyckeltal</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {municipality.safety_score !== null && municipality.safety_score !== undefined && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-green-200">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="text-2xl font-bold text-gray-800">{municipality.safety_score.toFixed(1)}/100</div>
                <div className="text-sm text-gray-600">Säkerhet</div>
              </div>
            )}

            {municipality.school_rating !== null && municipality.school_rating !== undefined && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-gray-800">{municipality.school_rating.toFixed(1)}/100</div>
                <div className="text-sm text-gray-600">Skolbetyg</div>
              </div>
            )}

            {municipality.price_per_sqm !== null && municipality.price_per_sqm !== undefined && (
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border-2 border-amber-200">
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-gray-800">{municipality.price_per_sqm.toLocaleString('sv-SE')} kr</div>
                <div className="text-sm text-gray-600">Bostadspris/m²</div>
              </div>
            )}

            {municipality.employment_rate !== null && municipality.employment_rate !== undefined && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="text-3xl mb-2">💼</div>
                <div className="text-2xl font-bold text-gray-800">{municipality.employment_rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Sysselsättning</div>
              </div>
            )}
          </div>
        </div>

        {/* Foreign Background Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Utländsk bakgrund</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {municipality.procent_utlandsk_bakgrund !== null && municipality.procent_utlandsk_bakgrund !== undefined && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🌍</span>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Totalt med utländsk bakgrund
                  </h3>
                </div>
                <p className="text-3xl font-bold text-blue-700">
                  {municipality.procent_utlandsk_bakgrund.toFixed(1)}%
                </p>
                {municipality.utlandsk_bakgrund_total && (
                  <p className="text-sm text-gray-600 mt-2">
                    {municipality.utlandsk_bakgrund_total.toLocaleString('sv-SE')} personer
                  </p>
                )}
              </div>
            )}

            {municipality.utrikes_fodda !== null && municipality.utrikes_fodda !== undefined && (
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">✈️</span>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Utrikes födda
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-700">
                  {municipality.utrikes_fodda.toLocaleString('sv-SE')}
                </p>
                {municipality.population && (
                  <p className="text-sm text-gray-600 mt-2">
                    {((municipality.utrikes_fodda / municipality.population) * 100).toFixed(1)}% av befolkningen
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {municipality.tva_utrikes_foraldrar !== null && municipality.tva_utrikes_foraldrar !== undefined && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  👨‍👩‍👧 Två utrikes födda föräldrar
                </h4>
                <p className="text-2xl font-bold text-purple-700">
                  {municipality.tva_utrikes_foraldrar.toLocaleString('sv-SE')}
                </p>
              </div>
            )}

            {municipality.en_utrikes_foraldrar !== null && municipality.en_utrikes_foraldrar !== undefined && (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border-2 border-indigo-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  👤 En utrikes född förälder
                </h4>
                <p className="text-2xl font-bold text-indigo-700">
                  {municipality.en_utrikes_foraldrar.toLocaleString('sv-SE')}
                </p>
              </div>
            )}

            {municipality.tva_inrikes_foraldrar !== null && municipality.tva_inrikes_foraldrar !== undefined && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  🇸🇪 Två inrikes födda föräldrar
                </h4>
                <p className="text-2xl font-bold text-gray-700">
                  {municipality.tva_inrikes_foraldrar.toLocaleString('sv-SE')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Birth Countries Section */}
        {birthCountries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🌎 Vanligaste födelseländer</h2>
            <div className="space-y-3">
              {birthCountries.slice(0, 10).map((country, index) => {
                const percentOfForeign = municipality.utrikes_fodda
                  ? (country.count / municipality.utrikes_fodda) * 100
                  : 0

                return (
                  <div
                    key={country.country}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-blue-50 rounded-lg hover:from-amber-100 hover:to-blue-100 transition-all border border-amber-200"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-amber-600 w-8">
                        {index + 1}
                      </span>
                      <span className="text-lg font-semibold text-gray-800">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-blue-700">
                        {country.count.toLocaleString('sv-SE')}
                      </span>
                      {percentOfForeign <= 100 && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({percentOfForeign.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <footer className="bg-gray-800 text-white p-8 rounded-2xl">
            <p className="text-sm mb-2">
              Data sammanställd av{' '}
              <a
                href="https://twitter.com/DisturbingEU"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold"
              >
                @DisturbingEU
              </a>
            </p>
          </footer>
        </div>
      </main>
    </div>
  )
}
