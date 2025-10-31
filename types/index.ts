export interface Municipality {
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
