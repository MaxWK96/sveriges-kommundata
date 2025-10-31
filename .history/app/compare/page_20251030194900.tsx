'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Municipality } from '@/types/index'

export default function ComparePage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([])
  const [selectedMunicipalities, setSelectedMunicipalities] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<Municipality[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchMunicipalities() {
      try {
        const response = await fetch('/api/municipalities')
        if (!response.ok) throw new Error('Failed to fetch municipalities')
        const data = await response.json()
        setMunicipalities(data)
        setError('')
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMunicipalities()
  }, [])

  useEffect(() => {
    if (selectedMunicipalities.length === 0) {
      setComparisonData([])
      return
    }

    async function fetchComparisonData() {
      try {
        const data = await Promise.all(
          selectedMunicipalities.map(async (id) => {
            const response = await fetch(`/api/municipalities/${id}`)
            if (!response.ok) throw new Error(`Failed to fetch data for municipality ${id}`)
            return response.json()
          })
        )
        setComparisonData(data)
        setError('')
      } catch (err: any) {
        setError(err.message)
      }
    }

    fetchComparisonData()
  }, [selectedMunicipalities])

  const handleMunicipalitySelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const id = event.target.value
    if (id && !selectedMunicipalities.includes(id)) {
      setSelectedMunicipalities([...selectedMunicipalities, id])
    }
  }

  const removeMunicipality = (id: string) => {
    setSelectedMunicipalities(selectedMunicipalities.filter(m => m !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 p-8">
        <div className="container mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 p-8">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-700 transition font-medium"
          >
            <ArrowLeft size={20} />
            Tillbaka till översikten
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-amber-100 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Jämför kommuner</h1>

          {/* Municipality Selector */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Välj kommuner att jämföra (max 3)
            </label>
            <select
              className="w-full p-3 border-2 border-amber-200 rounded-lg focus:border-amber-500 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
              onChange={handleMunicipalitySelect}
              value=""
              disabled={selectedMunicipalities.length >= 3}
            >
              <option value="">Välj kommun...</option>
              {municipalities
                .filter(m => !selectedMunicipalities.includes(m.id.toString()))
                .map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Comparison Table */}
          {comparisonData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="px-4 py-3 text-left text-gray-600">Mått</th>
                    {comparisonData.map(m => (
                      <th key={m.id} className="px-4 py-3 text-center">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">{m.name}</span>
                          <button
                            onClick={() => removeMunicipality(m.id.toString())}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600">Befolkning</td>
                    {comparisonData.map(m => (
                      <td key={m.id} className="px-4 py-3 text-center font-medium">
                        {m.population.toLocaleString('sv-SE')}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600">Säkerhetsbetyg</td>
                    {comparisonData.map(m => (
                      <td key={m.id} className="px-4 py-3 text-center font-medium">
                        {m.safety_score.toFixed(1)}/10
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600">Skolbetyg</td>
                    {comparisonData.map(m => (
                      <td key={m.id} className="px-4 py-3 text-center font-medium">
                        {m.school_rating.toFixed(1)}/10
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600">Bostadspris (kr/m²)</td>
                    {comparisonData.map(m => (
                      <td key={m.id} className="px-4 py-3 text-center font-medium">
                        {m.price_per_sqm.toLocaleString('sv-SE')}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-gray-600">Sysselsättning</td>
                    {comparisonData.map(m => (
                      <td key={m.id} className="px-4 py-3 text-center font-medium">
                        {m.employment_rate.toFixed(1)}%
                      </td>
                    ))}
                  </tr>
                  {comparisonData[0].procent_utlandsk_bakgrund !== undefined && (
                    <tr className="border-b border-gray-200">
                      <td className="px-4 py-3 text-gray-600">Utländsk bakgrund</td>
                      {comparisonData.map(m => (
                        <td key={m.id} className="px-4 py-3 text-center font-medium">
                          {m.procent_utlandsk_bakgrund?.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {selectedMunicipalities.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Välj kommuner ovan för att börja jämföra
            </div>
          )}
        </div>
      </div>
    </div>
  )
}