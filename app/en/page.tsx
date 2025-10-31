'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Heart,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle
} from 'lucide-react'

interface Municipality {
  id: string
  name: string
  population: number
  safety_score?: number | null  // 0-100 scale
  price_per_sqm?: number | null
  school_rating?: number | null  // 0-100 scale
  employment_rate?: number | null
  utrikes_fodda?: number | null
  tva_utrikes_foraldrar?: number | null
  en_utrikes_foraldrar?: number | null
  tva_inrikes_foraldrar?: number | null
  utlandsk_bakgrund_total?: number | null
  procent_utlandsk_bakgrund?: number | null
  top_fodelselander?: string | null
}

type SortField = 'name' | 'population' | 'safety_score' | 'price_per_sqm' | 'school_rating' | 'employment_rate' | 'procent_utlandsk_bakgrund'
type SortOrder = 'asc' | 'desc'

const ITEMS_PER_PAGE = 15

// Swedish Flag SVG Component
const SwedishFlag = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size * 0.625} viewBox="0 0 16 10" xmlns="http://www.w3.org/2000/svg">
    <rect width="16" height="10" fill="#006AA7"/>
    <rect x="5" y="0" width="2" height="10" fill="#FECC00"/>
    <rect x="0" y="4" width="16" height="2" fill="#FECC00"/>
  </svg>
)

// British Flag SVG Component
const BritishFlag = ({ size = 60 }: { size?: number }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <rect width="60" height="30" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
)

export default function EnglishHomePage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<Municipality[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showCharts, setShowCharts] = useState(false)
  const [sortField, setSortField] = useState<SortField>('population')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  const [populationRange, setPopulationRange] = useState<[number, number]>([0, 1000000])
  const [safetyRange, setSafetyRange] = useState<[number, number]>([0, 100])
  const [housingRange, setHousingRange] = useState<[number, number]>([0, 100000])
  const [schoolRange, setSchoolRange] = useState<[number, number]>([0, 100])
  const [employmentRange, setEmploymentRange] = useState<[number, number]>([0, 100])
  const [foreignBackgroundRange, setForeignBackgroundRange] = useState<[number, number]>([0, 100])

  useEffect(() => {
    async function fetchMunicipalities() {
      try {
        console.log('🔍 Fetching municipalities from API...')
        const response = await fetch('/api/municipalities')
        
        console.log('📡 API Response status:', response.status)
        
        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API Error:', errorText)
          throw new Error(`API responded with status ${response.status}`)
        }
        
        const data = await response.json()
        console.log('✅ Received data:', data.length, 'municipalities')
        console.log('📊 First municipality:', data[0])
        
        setMunicipalities(data)
        setFilteredMunicipalities(data)
        
        const savedFavorites = JSON.parse(localStorage.getItem('favoriteMunicipalities') || '[]')
        setFavorites(savedFavorites)
        
        setError('')
      } catch (err: any) {
        console.error('❌ Fetch error:', err)
        setError(err.message || 'Could not fetch municipalities')
      } finally {
        setLoading(false)
      }
    }

    fetchMunicipalities()
  }, [])

  useEffect(() => {
    let filtered = municipalities.filter(m => {
      // SAFETY: Handle both 'kommun' and 'name' for backwards compatibility
      const municipalityName = m.name || (m as any).name || ''
      const matchesSearch = municipalityName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesPopulation = m.population >= populationRange[0] && m.population <= populationRange[1]
      const matchesSafety = (m.safety_score ?? 0) >= safetyRange[0] && (m.safety_score ?? 0) <= safetyRange[1]
      const matchesHousing = (m.price_per_sqm ?? 0) >= housingRange[0] && (m.price_per_sqm ?? 0) <= housingRange[1]
      const matchesSchool = (m.school_rating ?? 0) >= schoolRange[0] && (m.school_rating ?? 0) <= schoolRange[1]
      const matchesEmployment = (m.employment_rate ?? 0) >= employmentRange[0] && (m.employment_rate ?? 0) <= employmentRange[1]
      
      // FIXED: Hantera både null och undefined för procent_utlandsk_bakgrund
      const foreignBg = m.procent_utlandsk_bakgrund ?? 0
      const matchesForeign = foreignBg >= foreignBackgroundRange[0] && foreignBg <= foreignBackgroundRange[1]
      
      return matchesSearch && matchesPopulation && matchesSafety && matchesHousing && 
             matchesSchool && matchesEmployment && matchesForeign
    })

    filtered.sort((a, b) => {
      const aValue = a[sortField] ?? 0
      const bValue = b[sortField] ?? 0
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
    })

    setFilteredMunicipalities(filtered)
    setCurrentPage(1) // Reset till sida 1 när filter ändras
  }, [searchQuery, municipalities, sortField, sortOrder, populationRange, safetyRange, 
      housingRange, schoolRange, employmentRange, foreignBackgroundRange])

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter(fav => fav !== id)
      : [...favorites, id]
    
    setFavorites(newFavorites)
    localStorage.setItem('favoriteMunicipalities', JSON.stringify(newFavorites))
  }

  const resetFilters = () => {
    setSearchQuery('')
    setPopulationRange([0, 1000000])
    setSafetyRange([0, 100])
    setHousingRange([0, 100000])
    setSchoolRange([0, 100])
    setEmploymentRange([0, 100])
    setForeignBackgroundRange([0, 100])
    setCurrentPage(1)
  }

  // Paginering
  const totalPages = Math.ceil(filteredMunicipalities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentMunicipalities = filteredMunicipalities.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chartData = {
    topByPopulation: [...filteredMunicipalities].slice(0, 10),
    averages: {
      safety: filteredMunicipalities.reduce((sum, m) => sum + (m.safety_score ?? 0), 0) / filteredMunicipalities.length || 0,
      housing: filteredMunicipalities.reduce((sum, m) => sum + (m.price_per_sqm ?? 0), 0) / filteredMunicipalities.length || 0,
      school: filteredMunicipalities.reduce((sum, m) => sum + (m.school_rating ?? 0), 0) / filteredMunicipalities.length || 0,
      employment: filteredMunicipalities.reduce((sum, m) => sum + (m.employment_rate ?? 0), 0) / filteredMunicipalities.length || 0,
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading municipalities...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-6">
            <AlertCircle className="text-red-500" size={48} />
            <h1 className="text-3xl font-bold text-gray-800">An error occurred</h1>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </div>

          <div className="space-y-4 text-gray-700">
            <h2 className="text-xl font-bold">Possible causes:</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>API routes are not created correctly</li>
              <li>Environment variables (.env.local) are missing or incorrect</li>
              <li>Supabase database is not configured</li>
            </ol>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mt-6">
              <h3 className="font-bold mb-2">🔧 Solution:</h3>
              <p className="text-sm mb-3">Open this page to debug the problem:</p>
              <Link 
                href="/test" 
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium"
              >
                Go to Debug page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      {/* Header with SVG Flags */}
      <header className="bg-gradient-to-r from-amber-100 to-blue-100 text-gray-800 shadow-xl border-b-4 border-amber-300">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SwedishFlag size={60} />
              <div>
                <h1 className="text-4xl font-bold text-gray-800">Swedish Municipality Data</h1>
                <p className="text-gray-700 mt-1">Compare all Swedish municipalities</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Link
                href="/compare"
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg text-sm sm:text-base"
              >
                ⚖️ Compare
              </Link>

              <button
                onClick={() => setShowCharts(!showCharts)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all shadow-lg text-sm sm:text-base ${
                  showCharts
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/80 hover:bg-white text-gray-800 border-2 border-amber-200'
                }`}
              >
                <BarChart3 size={20} className="inline mr-2" />
                {showCharts ? 'Hide' : 'Show'} Charts
              </button>

              <Link
                href="/"
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium bg-white/80 hover:bg-white text-gray-800 border-2 border-amber-200 transition-all shadow-lg flex items-center gap-2 text-sm sm:text-base"
              >
                <SwedishFlag size={24} />
                <span>Svenska</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-amber-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search municipality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none text-gray-800"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                showFilters
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              Avancerade filter
              <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            
            <select
              value={`${sortField}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortField(field as SortField)
                setSortOrder(order as SortOrder)
              }}
              className="px-6 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none text-gray-800 font-medium bg-white"
            >
              <option value="population-desc">Population (High-Low)</option>
              <option value="population-asc">Population (Low-High)</option>
              <option value="safety_score-desc">Safety (High-Low)</option>
              <option value="safety_score-asc">Safety (Low-High)</option>
              <option value="school_rating-desc">School Rating (High-Low)</option>
              <option value="school_rating-asc">School Rating (Low-High)</option>
              <option value="price_per_sqm-desc">Housing Price (High-Low)</option>
              <option value="price_per_sqm-asc">Housing Price (Low-High)</option>
              <option value="employment_rate-desc">Employment (High-Low)</option>
              <option value="employment_rate-asc">Employment (Low-High)</option>
              <option value="procent_utlandsk_bakgrund-desc">Foreign Background % (High-Low)</option>
              <option value="procent_utlandsk_bakgrund-asc">Foreign Background % (Low-High)</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-amber-200 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filter results</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <X size={16} />
                  Reset all filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Befolkning: {populationRange[0].toLocaleString('sv-SE')} - {populationRange[1].toLocaleString('sv-SE')}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={populationRange[1]}
                    onChange={(e) => setPopulationRange([populationRange[0], parseInt(e.target.value)])}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Safety (min): {safetyRange[0].toFixed(1)}/100
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={safetyRange[0]}
                    onChange={(e) => setSafetyRange([parseFloat(e.target.value), 100])}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Housing Price (max): {housingRange[1].toLocaleString('sv-SE')} kr/m²
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={housingRange[1]}
                    onChange={(e) => setHousingRange([0, parseInt(e.target.value)])}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    School Rating (min): {schoolRange[0].toFixed(1)}/100
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={schoolRange[0]}
                    onChange={(e) => setSchoolRange([parseFloat(e.target.value), 100])}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment (min): {employmentRange[0].toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={employmentRange[0]}
                    onChange={(e) => setEmploymentRange([parseFloat(e.target.value), 100])}
                    className="w-full accent-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Foreign Background (max): {foreignBackgroundRange[1].toFixed(1)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={foreignBackgroundRange[1]}
                    onChange={(e) => setForeignBackgroundRange([0, parseFloat(e.target.value)])}
                    className="w-full accent-amber-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Charts Section */}
        {showCharts && filteredMunicipalities.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-amber-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <BarChart3 className="text-amber-600" />
              Statistik & Diagram
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border-2 border-green-200">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.safety.toFixed(1)}/10</div>
                <div className="text-sm text-gray-600">Average safety</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.school.toFixed(1)}/10</div>
                <div className="text-sm text-gray-600">Average school rating</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border-2 border-amber-200">
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.housing.toFixed(0)} kr</div>
                <div className="text-sm text-gray-600">Average housing price/m²</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="text-3xl mb-2">💼</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.employment.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Average employment</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Largest Municipalities</h3>
              <div className="space-y-3">
                {chartData.topByPopulation.map((m) => {
                  const maxPop = chartData.topByPopulation[0].population
                  const percentage = (m.population / maxPop) * 100
                  
                  return (
                    <div key={m.id} className="flex items-center gap-4">
                      <div className="w-32 text-right font-medium text-gray-700">{m.name || 'Unknown'}</div>
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-8 relative">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-blue-500 rounded-full h-8 flex items-center justify-end pr-3 text-white font-semibold transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          >
                            {m.population.toLocaleString('sv-SE')}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Results Count & Pagination Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing {currentMunicipalities.length} of {filteredMunicipalities.length} municipalities
            {filteredMunicipalities.length > 0 && (
              <span className="ml-2 text-sm">
                (page {currentPage} of {totalPages})
              </span>
            )}
          </p>
          {favorites.length > 0 && (
            <p className="text-gray-600 flex items-center gap-2">
              <Heart size={16} className="text-red-500" fill="currentColor" />
              <span className="font-bold">{favorites.length}</span> favorites
            </p>
          )}
        </div>

        {/* Municipality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentMunicipalities.map((municipality) => (
            <div
              key={municipality.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-amber-100 hover:border-amber-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition">
                      {municipality.name || 'Unknown municipality'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {municipality.population.toLocaleString('sv-SE')} residents
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(municipality.id)
                    }}
                    className="p-2 rounded-full hover:bg-amber-50 transition"
                  >
                    <Heart
                      size={24}
                      className={favorites.includes(municipality.id) ? 'text-red-500' : 'text-gray-400'}
                      fill={favorites.includes(municipality.id) ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  {municipality.safety_score != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🛡️ Safety</span>
                      <span className="font-semibold text-gray-800">{(municipality.safety_score ?? 0).toFixed(1)}/100</span>
                    </div>
                  )}
                  {municipality.school_rating != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">📚 School Rating</span>
                      <span className="font-semibold text-gray-800">{(municipality.school_rating ?? 0).toFixed(1)}/100</span>
                    </div>
                  )}
                  {municipality.price_per_sqm != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🏠 Housing Price</span>
                      <span className="font-semibold text-gray-800">{(municipality.price_per_sqm ?? 0).toLocaleString('sv-SE')} kr/m²</span>
                    </div>
                  )}
                  {municipality.employment_rate != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">💼 Employment</span>
                      <span className="font-semibold text-gray-800">{(municipality.employment_rate ?? 0).toFixed(1)}%</span>
                    </div>
                  )}
                  {municipality.procent_utlandsk_bakgrund != null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🌍 Foreign Background</span>
                      <span className="font-semibold text-gray-800">{(municipality.procent_utlandsk_bakgrund ?? 0).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <Link
                  href={`/municipality/${municipality.id}`}
                  className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg hover:bg-amber-700 transition font-medium mt-4"
                >
                  View details →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {filteredMunicipalities.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center items-center gap-2 my-8">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg transition ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-amber-100 border-2 border-amber-200'
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2 rounded-lg transition font-semibold ${
                      pageNum === currentPage
                        ? 'bg-gradient-to-r from-amber-600 to-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-amber-100 border-2 border-amber-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                return <span key={pageNum} className="px-2 text-gray-400">...</span>
              }
              return null
            })}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg transition ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-amber-100 border-2 border-amber-200'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {filteredMunicipalities.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No municipalities found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search for something else</p>
            <button
              onClick={resetFilters}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-100 to-blue-100 text-gray-800 py-8 mt-12 border-t-4 border-amber-300">
        <div className="container mx-auto px-6 text-center">
          <p className="mb-4 font-medium">Data från SCB, Brå, Skolverket och andra officiella källor</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/about" className="hover:text-amber-700 font-medium">Om tjänsten</Link>
            <span>•</span>
            <Link href="/compare" className="hover:text-amber-700 font-medium">Jämför</Link>
            <span>•</span>
            <Link href="/map" className="hover:text-amber-700 font-medium">Karta</Link>
            <span>•</span>
            <a href="https://twitter.com/dittTwitterHandle" target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 font-medium">
              Följ oss på Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}