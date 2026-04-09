import { useEffect } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'

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

  // Refetch stale data when the tab regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return

      const { apiKey, location, lastFetchedAt, loading } = useWeatherStore.getState()
      if (!apiKey || !location || loading) return

      const isStale = !lastFetchedAt || Date.now() - lastFetchedAt > STALE_THRESHOLD_MS
      if (isStale) {
        fetchForecast()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchForecast])
}
