import type { GeocodingResult } from '../types/forecast'

const GEOCODE_URL = 'https://nominatim.openstreetmap.org'
const USER_AGENT = 'WeatherForecastApp/1.0'

interface NominatimResult {
  place_id: number
  name: string
  lat: string
  lon: string
  address?: {
    country?: string
    state?: string
    country_code?: string
  }
}

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return []

  const url = `${GEOCODE_URL}/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&limit=5&accept-language=en`
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) {
    throw new Error('Geocoding request failed')
  }

  const data: NominatimResult[] = await response.json()

  return data.map((r) => ({
    id: r.place_id,
    name: r.name,
    latitude: Number.parseFloat(r.lat),
    longitude: Number.parseFloat(r.lon),
    country: r.address?.country ?? '',
    admin1: r.address?.state,
    country_code: r.address?.country_code ?? '',
  }))
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = `${GEOCODE_URL}/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
  const response = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
  })

  if (!response.ok) return `${lat.toFixed(2)}, ${lon.toFixed(2)}`

  const data = await response.json()
  const city =
    data.address?.city || data.address?.town || data.address?.village || data.address?.county
  const country = data.address?.country

  if (city && country) return `${city}, ${country}`
  if (city) return city
  return `${lat.toFixed(2)}, ${lon.toFixed(2)}`
}
