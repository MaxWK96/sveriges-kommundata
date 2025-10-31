'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Municipality {
  id: string
  name: string
  population: number
  safety_score?: number | null
  price_per_sqm?: number | null
  school_rating?: number | null
  employment_rate?: number | null
  utrikes_fodda?: number | null
  tva_utrikes_foraldrar?: number | null
  en_utrikes_foraldrar?: number | null
  tva_inrikes_foraldrar?: number | null
  utlandsk_bakgrund_total?: number | null
  procent_utlandsk_bakgrund?: number | null
  top_fodelselander?: string | null
}

export default function Home() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [favorites, setFavorites] = useState<string[]>([])

  // Filter states - CRITICAL: 0-100 scale, not 0-10!
  const [safetyRange, setSafetyRange] = useState<[number, number]>([0, 100])
  const [schoolRange, setSchoolRange] = useState<[number, number]>([0, 100])
  const [employmentRange, setEmploymentRange] = useState<[number, number]>([0, 100])
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000])
  const [foreignBackgroundRange, setForeignBackgroundRange] = useState<[number, number]>([0, 100])

  const itemsPerPage = 15

  useEffect(() => {
    const loadedFavorites = localStorage.getItem('favorites')
    if (loadedFavorites) {
      setFavorites(JSON.parse(loadedFavorites))
    }
  }, [])

  useEffect(() => {
    fetch('/api/municipalities')
      .then((res) => res.json())
      .then((data) => {
        console.log('✅ Received data:', data.length, 'municipalities')
        setMunicipalities(data)
        setFilteredMunicipalities(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('❌ Error fetching municipalities:', error)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    const filtered = municipalities.filter((m) => {
      // Fixed: Added null check for m.name
      const matchesSearch = (m.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      const matchesSafety = !m.safety_score || (m.safety_score >= safetyRange[0] && m.safety_score <= safetyRange[1])
      const matchesSchool = !m.school_rating || (m.school_rating >= schoolRange[0] && m.school_rating <= schoolRange[1])
      const matchesEmployment = !m.employment_rate || (m.employment_rate >= employmentRange[0] && m.employment_rate <= employmentRange[1])
      const matchesPrice = !m.price_per_sqm || (m.price_per_sqm >= priceRange[0] && m.price_per_sqm <= priceRange[1])
      const matchesForeignBackground = !m.procent_utlandsk_bakgrund || (m.procent_utlandsk_bakgrund >= foreignBackgroundRange[0] && m.procent_utlandsk_bakgrund <= foreignBackgroundRange[1])

      return matchesSearch && matchesSafety && matchesSchool && matchesEmployment && matchesPrice && matchesForeignBackground
    })

    console.log('🔍 Filtered results:', filtered.length, 'municipalities')
    setFilteredMunicipalities(filtered)
    setCurrentPage(1)
  }, [searchQuery, municipalities, safetyRange, schoolRange, employmentRange, priceRange, foreignBackgroundRange])

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  const totalPages = Math.ceil(filteredMunicipalities.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMunicipalities = filteredMunicipalities.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-2xl">Laddar kommuner...</div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Svenska Kommuner</h1>
        <p className="text-xl text-gray-600">
          Jämför säkerhet, skolbetyg, bostadspriser och utländsk bakgrund för Sveriges {municipalities.length} kommuner
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Link href="/en" className="text-blue-600 hover:underline">
            English
          </Link>
          <Link href="/compare" className="text-blue-600 hover:underline">
            Jämför kommuner
          </Link>
          <Link href="/about" className="text-blue-600 hover:underline">
            Om tjänsten
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-2">
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

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="mb-6">
          <input
            type="text"
            placeholder="Sök kommun..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Säkerhet: {safetyRange[0]} - {safetyRange[1]} / 100
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={safetyRange[0]}
                onChange={(e) => setSafetyRange([parseInt(e.target.value), safetyRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={safetyRange[1]}
                onChange={(e) => setSafetyRange([safetyRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skolbetyg: {schoolRange[0]} - {schoolRange[1]} / 100
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={schoolRange[0]}
                onChange={(e) => setSchoolRange([parseInt(e.target.value), schoolRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={schoolRange[1]}
                onChange={(e) => setSchoolRange([schoolRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sysselsättning: {employmentRange[0]} - {employmentRange[1]}%
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={employmentRange[0]}
                onChange={(e) => setEmploymentRange([parseInt(e.target.value), employmentRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={employmentRange[1]}
                onChange={(e) => setEmploymentRange([employmentRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bostadspris: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} kr/m²
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="150000"
                step="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Utländsk bakgrund: {foreignBackgroundRange[0]} - {foreignBackgroundRange[1]}%
            </label>
            <div className="flex gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={foreignBackgroundRange[0]}
                onChange={(e) => setForeignBackgroundRange([parseInt(e.target.value), foreignBackgroundRange[1]])}
                className="w-full"
              />
              <input
                type="range"
                min="0"
                max="100"
                value={foreignBackgroundRange[1]}
                onChange={(e) => setForeignBackgroundRange([foreignBackgroundRange[0], parseInt(e.target.value)])}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <p className="text-lg font-semibold">
          Visar {currentMunicipalities.length} av {filteredMunicipalities.length} kommuner
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentMunicipalities.map((municipality) => (
          <div key={municipality.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <Link href={`/municipality/${municipality.id}`}>
                <h2 className="text-2xl font-bold text-blue-600 hover:underline cursor-pointer">
                  {municipality.name}
                </h2>
              </Link>
              <button
                onClick={() => toggleFavorite(municipality.id)}
                className="text-2xl focus:outline-none"
                aria-label="Toggle favorite"
              >
                {favorites.includes(municipality.id) ? '⭐' : '☆'}
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span className="text-gray-600">Befolkning:</span>
                <span className="font-semibold">{municipality.population?.toLocaleString() || 'N/A'}</span>
              </p>
              {municipality.safety_score !== null && municipality.safety_score !== undefined && (
                <p className="flex justify-between">
                  <span className="text-gray-600">Säkerhet:</span>
                  <span className="font-semibold">{municipality.safety_score.toFixed(1)} / 100</span>
                </p>
              )}
              {municipality.school_rating !== null && municipality.school_rating !== undefined && (
                <p className="flex justify-between">
                  <span className="text-gray-600">Skolbetyg:</span>
                  <span className="font-semibold">{municipality.school_rating.toFixed(1)} / 100</span>
                </p>
              )}
              {municipality.employment_rate !== null && municipality.employment_rate !== undefined && (
                <p className="flex justify-between">
                  <span className="text-gray-600">Sysselsättning:</span>
                  <span className="font-semibold">{municipality.employment_rate.toFixed(1)}%</span>
                </p>
              )}
              {municipality.price_per_sqm !== null && municipality.price_per_sqm !== undefined && (
                <p className="flex justify-between">
                  <span className="text-gray-600">Bostadspris:</span>
                  <span className="font-semibold">{municipality.price_per_sqm.toLocaleString()} kr/m²</span>
                </p>
              )}
              {municipality.procent_utlandsk_bakgrund !== null && municipality.procent_utlandsk_bakgrund !== undefined && (
                <p className="flex justify-between">
                  <span className="text-gray-600">Utländsk bakgrund:</span>
                  <span className="font-semibold">{municipality.procent_utlandsk_bakgrund.toFixed(1)}%</span>
                </p>
              )}
            </div>

            <Link href={`/municipality/${municipality.id}`}>
              <button className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                Visa detaljer
              </button>
            </Link>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Föregående
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded">
            Sida {currentPage} av {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Nästa
          </button>
        </div>
      )}
    </main>
  )
}
