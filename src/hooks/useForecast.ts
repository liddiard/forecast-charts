import { useEffect } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'
import { getDayStartMs } from '../utils/timezone'

const STALE_THRESHOLD_MS = 60 * 60 * 1000 // 1 hour

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
        // Compare day boundaries in the forecast location's timezone, not the browser's
        const { timezone } = forecast
        const forecastFirstDay = getDayStartMs(forecast.daily.data[0].time * 1000, timezone)
        const todayStart = getDayStartMs(Date.now(), timezone)
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
