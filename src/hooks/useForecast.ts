import { useEffect } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'

const STALE_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

/** Returns the start-of-day timestamp (ms) for a given timestamp in ms. */
const getDayStart = (timestampMs: number) => {
  const d = new Date(timestampMs)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function useForecast() {
  const apiKey = useWeatherStore((s) => s.apiKey)
  const location = useWeatherStore((s) => s.location)
  const fetchForecast = useWeatherStore((s) => s.fetchForecast)

  // Fetch forecast when apiKey or location changes
  useEffect(() => {
    if (apiKey && location) {
      fetchForecast()
    }
  }, [apiKey, location, fetchForecast])

  // Refetch when the tab regains focus if data is stale or the day has changed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return

      const { apiKey, location, lastFetchedAt, loading, forecast } = useWeatherStore.getState()
      if (!apiKey || !location || loading) return

      const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_THRESHOLD_MS

      let dayChanged = false
      if (forecast?.daily?.data?.[0]) {
        const forecastFirstDay = getDayStart(forecast.daily.data[0].time * 1000)
        const todayStart = getDayStart(Date.now())
        dayChanged = forecastFirstDay < todayStart
      }

      // If day has changed since last fetch, hard reload the page to reset state.
      // Otherwise if data is stale, just refetch.
      if (dayChanged) {
        window.location.reload()
      } else if (isStale) {
        fetchForecast()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchForecast])
}
