import Link from 'next/link'
import { Heart, Info } from 'lucide-react'
import { useState } from 'react'

interface Municipality {
  id: string
  name: string
  population: number
  safety_score?: number | null
  price_per_sqm?: number | null
  school_rating?: number | null
  employment_rate?: number | null
  procent_utlandsk_bakgrund?: number | null
}

interface MunicipalityCardProps {
  municipality: Municipality
  isFavorite: boolean
  onToggleFavorite: () => void
}

// Helper function to get color based on value (0-100 scale)
const getScoreColor = (value: number | null | undefined): string => {
  if (value == null) return 'text-gray-400'
  if (value >= 75) return 'text-green-600'
  if (value >= 50) return 'text-yellow-600'
  if (value >= 25) return 'text-orange-600'
  return 'text-red-600'
}

// Helper function to get background color for score badges
const getScoreBgColor = (value: number | null | undefined): string => {
  if (value == null) return 'bg-gray-100'
  if (value >= 75) return 'bg-green-100'
  if (value >= 50) return 'bg-yellow-100'
  if (value >= 25) return 'bg-orange-100'
  return 'bg-red-100'
}

export default function MunicipalityCard({ municipality, isFavorite, onToggleFavorite }: MunicipalityCardProps) {
  const [showTooltip, setShowTooltip] = useState<string | null>(null)

  const tooltips = {
    safety: 'Säkerhetsvärde baserat på brottsstatistik och trygghetsmätningar (0-100)',
    school: 'Genomsnittligt meritvärde i årskurs 9 (0-100)',
    housing: 'Genomsnittligt pris per kvadratmeter för bostadsrätter',
    employment: 'Andel sysselsatta i åldern 20-64 år (%)',
    foreign: 'Andel med utländsk bakgrund av total befolkning (%)'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-amber-100 hover:border-amber-300">
      <div className="p-6">
        {/* Header with name and favorite */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-700 transition">
              {municipality.name || 'Okänd kommun'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              👥 {municipality.population.toLocaleString('sv-SE')} invånare
            </p>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite()
            }}
            className="p-2 rounded-full hover:bg-amber-50 transition"
            aria-label="Lägg till i favoriter"
          >
            <Heart
              size={24}
              className={isFavorite ? 'text-red-500' : 'text-gray-400'}
              fill={isFavorite ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Statistics with color coding */}
        <div className="space-y-3 mb-4">
          {municipality.safety_score != null && (
            <div className="relative group/tooltip">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🛡️ Säkerhet</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('safety')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className={`font-bold px-2 py-1 rounded ${getScoreBgColor(municipality.safety_score)} ${getScoreColor(municipality.safety_score)}`}>
                  {(municipality.safety_score ?? 0).toFixed(1)}/100
                </span>
              </div>
              {showTooltip === 'safety' && (
                <div className="absolute z-10 left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                  {tooltips.safety}
                </div>
              )}
            </div>
          )}

          {municipality.school_rating != null && (
            <div className="relative group/tooltip">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📚 Skolbetyg</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('school')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className={`font-bold px-2 py-1 rounded ${getScoreBgColor(municipality.school_rating)} ${getScoreColor(municipality.school_rating)}`}>
                  {(municipality.school_rating ?? 0).toFixed(1)}/100
                </span>
              </div>
              {showTooltip === 'school' && (
                <div className="absolute z-10 left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                  {tooltips.school}
                </div>
              )}
            </div>
          )}

          {municipality.price_per_sqm != null && (
            <div className="relative group/tooltip">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🏠 Bostadspris</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('housing')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className="font-semibold text-gray-800">
                  {(municipality.price_per_sqm ?? 0).toLocaleString('sv-SE')} kr/m²
                </span>
              </div>
              {showTooltip === 'housing' && (
                <div className="absolute z-10 left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                  {tooltips.housing}
                </div>
              )}
            </div>
          )}

          {municipality.employment_rate != null && (
            <div className="relative group/tooltip">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">💼 Sysselsättning</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('employment')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className={`font-bold px-2 py-1 rounded ${getScoreBgColor(municipality.employment_rate)} ${getScoreColor(municipality.employment_rate)}`}>
                  {(municipality.employment_rate ?? 0).toFixed(1)}%
                </span>
              </div>
              {showTooltip === 'employment' && (
                <div className="absolute z-10 left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                  {tooltips.employment}
                </div>
              )}
            </div>
          )}

          {municipality.procent_utlandsk_bakgrund != null && (
            <div className="relative group/tooltip">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🌍 Utländsk bakgrund</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onMouseEnter={() => setShowTooltip('foreign')}
                    onMouseLeave={() => setShowTooltip(null)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <span className="font-semibold text-gray-800">
                  {(municipality.procent_utlandsk_bakgrund ?? 0).toFixed(1)}%
                </span>
              </div>
              {showTooltip === 'foreign' && (
                <div className="absolute z-10 left-0 mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg max-w-xs">
                  {tooltips.foreign}
                </div>
              )}
            </div>
          )}
        </div>

        {/* View details button */}
        <Link
          href={`/municipality/${municipality.id}`}
          className="block w-full bg-amber-600 text-white text-center py-3 rounded-lg hover:bg-amber-700 transition font-medium mt-4"
        >
          Visa detaljer →
        </Link>
      </div>
    </div>
  )
}
