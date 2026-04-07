import type { PirateWeatherResponse } from '../types/forecast'

const BASE_URL = 'https://api.pirateweather.net/forecast'

async function fetchRegularForecast(
  apiKey: string,
  lat: number,
  lon: number,
): Promise<PirateWeatherResponse> {
  const url = `${BASE_URL}/${encodeURIComponent(apiKey)}/${lat},${lon}?extend=hourly&units=si&icon=pirate`
  const response = await fetch(url)
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Invalid API key. Please check your Pirate Weather API key.')
    }
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

async function fetchDayAtTime(
  apiKey: string,
  lat: number,
  lon: number,
  unixTime: number,
): Promise<PirateWeatherResponse> {
  // Embed the timestamp in the path (lat,lon,time) per the API's lat_and_long_or_time
  // spec — uses the same CORS-enabled api.pirateweather.net domain.
  const url = `${BASE_URL}/${encodeURIComponent(apiKey)}/${lat},${lon},${unixTime}?units=si&icon=pirate&tmextra=1`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Forecast API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export async function fetchForecast(
  apiKey: string,
  lat: number,
  lon: number,
): Promise<PirateWeatherResponse> {
  const forecast = await fetchRegularForecast(apiKey, lat, lon)

  // Compute today's midnight in the location's local timezone
  const offsetSeconds = forecast.offset * 3600
  const nowLocal = Date.now() / 1000 + offsetSeconds
  const midnightUnix = Math.floor(nowLocal / 86400) * 86400 - offsetSeconds

  // Prepend past hours from midnight if the forecast starts after midnight
  const firstForecastTime = forecast.hourly.data[0]?.time
  if (firstForecastTime !== undefined && midnightUnix < firstForecastTime) {
    const pastData = await fetchDayAtTime(apiKey, lat, lon, midnightUnix).catch(() => null)
    const pastPoints = pastData?.hourly.data.filter((p) => p.time < firstForecastTime) ?? []
    if (pastPoints.length > 0) {
      forecast.hourly.data = [...pastPoints, ...forecast.hourly.data]
    }
  }

  // Trim to exactly 7 full days from midnight so charts align with the daily forecast
  const chartEndUnix = midnightUnix + 7 * 86400
  forecast.hourly.data = forecast.hourly.data.filter((p) => p.time < chartEndUnix)
  forecast.daily.data = forecast.daily.data.slice(0, 7)

  return forecast
}
