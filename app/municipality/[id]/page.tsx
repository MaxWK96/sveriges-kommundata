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
  crime_rate?: number | null
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

          // Parse birth countries data
          if (data.top_fodelselander) {
            try {
              const parsed = JSON.parse(data.top_fodelselander)
              // Filter out "Sverige" to avoid percentage issues
              const filtered = Object.entries(parsed)
                .filter(([country]) => country.toLowerCase() !== 'sverige')
                .map(([country, count]) => ({
                  country,
                  count: count as number
                }))
                .sort((a, b) => b.count - a.count)
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Laddar kommun...</div>
      </div>
    )
  }

  if (!municipality) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Kommun hittades inte</h1>
          <Link href="/" className="text-blue-600 hover:underline">
            Tillbaka till startsidan
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-blue-600 hover:underline">
          ← Tillbaka till alla kommuner
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-2">{municipality.name}</h1>
        {municipality.county && (
          <p className="text-xl text-gray-600 mb-4">{municipality.county}</p>
        )}
        <p className="text-lg text-gray-500">
          Befolkning: <span className="font-semibold">{municipality.population?.toLocaleString()}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {municipality.safety_score !== null && municipality.safety_score !== undefined && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Säkerhet</h3>
            <p className="text-3xl font-bold text-blue-600">
              {municipality.safety_score.toFixed(1)} / 100
            </p>
          </div>
        )}

        {municipality.crime_rate !== null && municipality.crime_rate !== undefined && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Brottslighet</h3>
            <p className="text-3xl font-bold text-red-600">
              {municipality.crime_rate.toFixed(1)}
            </p>
          </div>
        )}

        {municipality.school_rating !== null && municipality.school_rating !== undefined && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Skolbetyg</h3>
            <p className="text-3xl font-bold text-green-600">
              {municipality.school_rating.toFixed(1)} / 100
            </p>
          </div>
        )}

        {municipality.employment_rate !== null && municipality.employment_rate !== undefined && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Sysselsättning</h3>
            <p className="text-3xl font-bold text-purple-600">
              {municipality.employment_rate.toFixed(1)}%
            </p>
          </div>
        )}

        {municipality.price_per_sqm !== null && municipality.price_per_sqm !== undefined && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Bostadspris</h3>
            <p className="text-3xl font-bold text-orange-600">
              {municipality.price_per_sqm.toLocaleString()} kr/m²
            </p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6">Utländsk bakgrund</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {municipality.procent_utlandsk_bakgrund !== null && municipality.procent_utlandsk_bakgrund !== undefined && (
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Totalt med utländsk bakgrund
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {municipality.procent_utlandsk_bakgrund.toFixed(1)}%
              </p>
              {municipality.utlandsk_bakgrund_total && (
                <p className="text-sm text-gray-600 mt-2">
                  {municipality.utlandsk_bakgrund_total.toLocaleString()} personer
                </p>
              )}
            </div>
          )}

          {municipality.utrikes_fodda !== null && municipality.utrikes_fodda !== undefined && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Utrikes födda
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {municipality.utrikes_fodda.toLocaleString()}
              </p>
              {municipality.population && (
                <p className="text-sm text-gray-600 mt-2">
                  {((municipality.utrikes_fodda / municipality.population) * 100).toFixed(1)}% av befolkningen
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {municipality.tva_utrikes_foraldrar !== null && municipality.tva_utrikes_foraldrar !== undefined && (
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Två utrikes födda föräldrar
              </h4>
              <p className="text-2xl font-bold text-purple-600">
                {municipality.tva_utrikes_foraldrar.toLocaleString()}
              </p>
            </div>
          )}

          {municipality.en_utrikes_foraldrar !== null && municipality.en_utrikes_foraldrar !== undefined && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                En utrikes född förälder
              </h4>
              <p className="text-2xl font-bold text-indigo-600">
                {municipality.en_utrikes_foraldrar.toLocaleString()}
              </p>
            </div>
          )}

          {municipality.tva_inrikes_foraldrar !== null && municipality.tva_inrikes_foraldrar !== undefined && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Två inrikes födda föräldrar
              </h4>
              <p className="text-2xl font-bold text-gray-600">
                {municipality.tva_inrikes_foraldrar.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {birthCountries.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Vanligaste födelseländer</h2>
          <div className="space-y-3">
            {birthCountries.slice(0, 10).map((country, index) => {
              const percentOfForeign = municipality.utrikes_fodda
                ? (country.count / municipality.utrikes_fodda) * 100
                : 0

              return (
                <div
                  key={country.country}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400 w-8">
                      {index + 1}
                    </span>
                    <span className="text-lg font-semibold">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-blue-600">
                      {country.count.toLocaleString()}
                    </span>
                    {/* Only show percentage if it's <= 100% (valid data) */}
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

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Data sammanställd av{' '}
          <a
            href="https://twitter.com/DisturbingEU"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            @DisturbingEU
          </a>
        </p>
      </div>
    </main>
  )
}
