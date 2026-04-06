import { useEffect } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'

export function useForecast() {
  const apiKey = useWeatherStore((s) => s.apiKey)
  const location = useWeatherStore((s) => s.location)
  const fetchForecast = useWeatherStore((s) => s.fetchForecast)

  useEffect(() => {
    if (apiKey && location) {
      fetchForecast()
    }
  }, [apiKey, location, fetchForecast])
}
