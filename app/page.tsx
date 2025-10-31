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
import MunicipalityCard from '@/components/MunicipalityCard'

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

export default function HomePage() {
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
        setError(err.message || 'Kunde inte hämta kommuner')
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

  // Count active filters
  const getActiveFilterCount = () => {
    let count = 0
    if (searchQuery) count++
    if (populationRange[1] < 1000000) count++
    if (safetyRange[0] > 0 || safetyRange[1] < 100) count++
    if (housingRange[1] < 100000) count++
    if (schoolRange[0] > 0 || schoolRange[1] < 100) count++
    if (employmentRange[0] > 0 || employmentRange[1] < 100) count++
    if (foreignBackgroundRange[1] < 100) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  // Calculate insights
  const getInsights = () => {
    if (municipalities.length === 0) return []

    const safestMunicipality = [...municipalities]
      .filter(m => m.safety_score != null)
      .sort((a, b) => (b.safety_score || 0) - (a.safety_score || 0))[0]

    const bestSchool = [...municipalities]
      .filter(m => m.school_rating != null)
      .sort((a, b) => (b.school_rating || 0) - (a.school_rating || 0))[0]

    const highestForeignBackground = [...municipalities]
      .filter(m => m.procent_utlandsk_bakgrund != null)
      .sort((a, b) => (b.procent_utlandsk_bakgrund || 0) - (a.procent_utlandsk_bakgrund || 0))[0]

    const mostExpensive = [...municipalities]
      .filter(m => m.price_per_sqm != null)
      .sort((a, b) => (b.price_per_sqm || 0) - (a.price_per_sqm || 0))[0]

    return [
      { text: `${safestMunicipality?.name} har högst säkerhetsvärde (${safestMunicipality?.safety_score?.toFixed(1)}/100)`, icon: '🛡️' },
      { text: `${bestSchool?.name} har högst skolbetyg (${bestSchool?.school_rating?.toFixed(1)}/100)`, icon: '📚' },
      { text: `${mostExpensive?.name} har dyrast bostadspris (${mostExpensive?.price_per_sqm?.toLocaleString('sv-SE')} kr/m²)`, icon: '🏠' },
      { text: `${highestForeignBackground?.name} har störst andel utländsk bakgrund (${highestForeignBackground?.procent_utlandsk_bakgrund?.toFixed(1)}%)`, icon: '🌍' }
    ]
  }

  const insights = getInsights()

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
          <p className="text-gray-600 text-lg">Laddar kommuner...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">Ett fel uppstod</h1>
          </div>
          
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 mb-6">
            <p className="text-red-800 font-mono text-sm">{error}</p>
          </div>

          <div className="space-y-4 text-gray-700">
            <h2 className="text-xl font-bold">Möjliga orsaker:</h2>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>API-routes är inte skapade korrekt</li>
              <li>Environment variables (.env.local) saknas eller är felaktiga</li>
              <li>Supabase-databasen är inte konfigurerad</li>
            </ol>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mt-6">
              <h3 className="font-bold mb-2">🔧 Lösning:</h3>
              <p className="text-sm mb-3">Öppna denna sida för att debugga problemet:</p>
              <Link 
                href="/test" 
                className="inline-block bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium"
              >
                Gå till Debug-sidan →
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
                <h1 className="text-4xl font-bold text-gray-800">Sveriges Kommundata</h1>
                <p className="text-gray-700 mt-1">Jämför alla Sveriges kommuner</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/compare"
                className="px-6 py-3 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                ⚖️ Jämför
              </Link>

              <button
                onClick={() => setShowCharts(!showCharts)}
                className={`px-6 py-3 rounded-lg font-medium transition-all shadow-lg ${
                  showCharts
                    ? 'bg-amber-600 text-white'
                    : 'bg-white/80 hover:bg-white text-gray-800 border-2 border-amber-200'
                }`}
              >
                <BarChart3 size={20} className="inline mr-2" />
                {showCharts ? 'Dölj' : 'Visa'} Diagram
              </button>
              
              <Link
                href="/en"
                className="px-6 py-3 rounded-lg font-medium bg-white/80 hover:bg-white text-gray-800 border-2 border-amber-200 transition-all shadow-lg flex items-center gap-2"
              >
                <BritishFlag size={24} />
                <span>English</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Last Updated & Insights Section */}
        <div className="mb-8 space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-amber-50 rounded-xl p-4 border-2 border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-semibold">📅 Senast uppdaterat:</span>
              <span>2024-01-15</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{municipalities.length} kommuner</span>
            </div>
          </div>

          {/* Interesting Insights */}
          {insights.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                💡 Intressanta insikter
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-amber-50 to-blue-50 rounded-lg p-4 border border-amber-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{insight.icon}</span>
                      <p className="text-sm text-gray-700 font-medium">{insight.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-amber-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Sök kommun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:outline-none text-gray-800"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 relative ${
                showFilters
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              Avancerade filter
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
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
              <option value="population-desc">Befolkning (Högst-Lägst)</option>
              <option value="population-asc">Befolkning (Lägst-Högst)</option>
              <option value="safety_score-desc">Säkerhet (Högst-Lägst)</option>
              <option value="safety_score-asc">Säkerhet (Lägst-Högst)</option>
              <option value="school_rating-desc">Skolbetyg (Högst-Lägst)</option>
              <option value="school_rating-asc">Skolbetyg (Lägst-Högst)</option>
              <option value="price_per_sqm-desc">Bostadspris (Högst-Lägst)</option>
              <option value="price_per_sqm-asc">Bostadspris (Lägst-Högst)</option>
              <option value="employment_rate-desc">Sysselsättning (Högst-Lägst)</option>
              <option value="employment_rate-asc">Sysselsättning (Lägst-Högst)</option>
              <option value="procent_utlandsk_bakgrund-desc">Utländsk bakgrund % (Högst-Lägst)</option>
              <option value="procent_utlandsk_bakgrund-asc">Utländsk bakgrund % (Lägst-Högst)</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-amber-200 space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Filtrera resultat</h3>
                <button
                  onClick={resetFilters}
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1"
                >
                  <X size={16} />
                  Återställ alla filter
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
                    Säkerhet (min): {safetyRange[0].toFixed(1)}/100
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
                    Bostadspris (max): {housingRange[1].toLocaleString('sv-SE')} kr/m²
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
                    Skolbetyg (min): {schoolRange[0].toFixed(1)}/100
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
                    Sysselsättning (min): {employmentRange[0].toFixed(1)}%
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
                    Utländsk bakgrund (max): {foreignBackgroundRange[1].toFixed(1)}%
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
                <div className="text-sm text-gray-600">Medel säkerhet</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border-2 border-blue-200">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.school.toFixed(1)}/10</div>
                <div className="text-sm text-gray-600">Medel skolbetyg</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border-2 border-amber-200">
                <div className="text-3xl mb-2">🏠</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.housing.toFixed(0)} kr</div>
                <div className="text-sm text-gray-600">Medel bostadspris/m²</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border-2 border-purple-200">
                <div className="text-3xl mb-2">💼</div>
                <div className="text-2xl font-bold text-gray-800">{chartData.averages.employment.toFixed(1)}%</div>
                <div className="text-sm text-gray-600">Medel sysselsättning</div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Största kommunerna</h3>
              <div className="space-y-3">
                {chartData.topByPopulation.map((m) => {
                  const maxPop = chartData.topByPopulation[0].population
                  const percentage = (m.population / maxPop) * 100
                  
                  return (
                    <div key={m.id} className="flex items-center gap-4">
                      <div className="w-32 text-right font-medium text-gray-700">{m.name || (m as any).name || 'Okänd'}</div>
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
            Visar <span className="font-bold text-amber-700">{currentMunicipalities.length}</span> av {filteredMunicipalities.length} kommuner
            {filteredMunicipalities.length > 0 && (
              <span className="ml-2 text-sm">
                (sida {currentPage} av {totalPages})
              </span>
            )}
          </p>
          {favorites.length > 0 && (
            <p className="text-gray-600 flex items-center gap-2">
              <Heart size={16} className="text-red-500" fill="currentColor" />
              <span className="font-bold">{favorites.length}</span> favoriter
            </p>
          )}
        </div>

        {/* Municipality Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentMunicipalities.map((municipality) => (
            <MunicipalityCard
              key={municipality.id}
              municipality={municipality}
              isFavorite={favorites.includes(municipality.id)}
              onToggleFavorite={() => toggleFavorite(municipality.id)}
            />
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
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Inga kommuner hittades</h3>
            <p className="text-gray-600 mb-4">Prova att justera dina filter eller sök efter något annat</p>
            <button
              onClick={resetFilters}
              className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition font-medium"
            >
              Återställ filter
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-100 to-blue-100 text-gray-800 py-8 mt-12 border-t-4 border-amber-300">
        <div className="container mx-auto px-6">
          <div className="text-center mb-6">
            <p className="mb-4 font-medium">Data från SCB, Brå, Skolverket och andra officiella källor</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <Link href="/about" className="hover:text-amber-700 font-medium">Om tjänsten</Link>
              <span>•</span>
              <Link href="/compare" className="hover:text-amber-700 font-medium">Jämför</Link>
              <span>•</span>
              <a href="https://twitter.com/DisturbingEU" target="_blank" rel="noopener noreferrer" className="hover:text-amber-700 font-medium">
                @DisturbingEU
              </a>
            </div>
          </div>

          {/* Social Sharing Buttons */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-700">Dela:</span>
            <button
              onClick={() => {
                const url = window.location.href
                const text = 'Kolla in Sveriges Kommundata - Jämför alla Sveriges kommuner!'
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              🐦 Twitter
            </button>
            <button
              onClick={() => {
                const url = window.location.href
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              📘 Facebook
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert('Länk kopierad!')
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              🔗 Kopiera länk
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Skapad av <a href="https://twitter.com/DisturbingEU" target="_blank" rel="noopener noreferrer" className="text-amber-700 hover:text-amber-800 font-semibold">@DisturbingEU</a></p>
          </div>
        </div>
      </footer>
    </div>
  )
}