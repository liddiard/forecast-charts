import type { GeocodingResult } from '../types/forecast'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (query.trim().length < 2) return []

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&language=en&format=json`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Geocoding request failed')
  }

  const data = await response.json()
  return data.results ?? []
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  // Use OpenMeteo's geocoding with coordinates to find nearest city name
  // Since OpenMeteo doesn't have reverse geocoding, use Nominatim for this
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`
  const response = await fetch(url, {
    headers: { 'User-Agent': 'WeatherForecastApp/1.0' },
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
