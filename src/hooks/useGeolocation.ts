import { useState, useCallback } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'
import { reverseGeocode } from '../api/geocoding'

export function useGeolocation() {
  const setLocation = useWeatherStore((s) => s.setLocation)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        try {
          const name = await reverseGeocode(latitude, longitude)
          setLocation({ lat: latitude, lon: longitude, name })
        } catch {
          setLocation({
            lat: latitude,
            lon: longitude,
            name: `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
          })
        }
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 10000 },
    )
  }, [setLocation])

  return { requestLocation, loading, error }
}
