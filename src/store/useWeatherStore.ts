import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PirateWeatherResponse } from '../types/forecast'
import { fetchForecast } from '../api/pirateWeather'
import type {
  UnitPreferences,
  TemperatureUnit,
  PressureUnit,
  PrecipUnit,
  WindSpeedUnit,
} from '../utils/units'
import { DEFAULT_UNITS } from '../utils/units'

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface LocationInfo {
  lat: number
  lon: number
  name: string
}

interface WeatherStore {
  // API key
  apiKey: string | null
  setApiKey: (key: string) => void

  // Location
  location: LocationInfo | null
  setLocation: (loc: LocationInfo) => void

  // Forecast
  forecast: PirateWeatherResponse | null
  loading: boolean
  error: string | null
  fetchForecast: () => Promise<void>

  // UI
  selectedDayIndex: number
  setSelectedDayIndex: (i: number) => void

  // Units
  units: UnitPreferences
  setTemperatureUnit: (u: TemperatureUnit) => void
  setPressureUnit: (u: PressureUnit) => void
  setPrecipUnit: (u: PrecipUnit) => void
  setWindSpeedUnit: (u: WindSpeedUnit) => void

  // Theme
  theme: ThemeMode
  setTheme: (t: ThemeMode) => void
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key }),

      location: null,
      setLocation: (loc) => set({ location: loc }),

      forecast: null,
      loading: false,
      error: null,
      fetchForecast: async () => {
        const { apiKey, location } = get()
        if (!apiKey || !location) return

        set({ loading: true, error: null })
        try {
          const data = await fetchForecast(apiKey, location.lat, location.lon)
          set({ forecast: data, loading: false })
        } catch (e) {
          set({ error: (e as Error).message, loading: false })
        }
      },

      selectedDayIndex: 0,
      setSelectedDayIndex: (i) => set({ selectedDayIndex: i }),

      units: DEFAULT_UNITS,
      setTemperatureUnit: (u) => set((s) => ({ units: { ...s.units, temperature: u } })),
      setPressureUnit: (u) => set((s) => ({ units: { ...s.units, pressure: u } })),
      setPrecipUnit: (u) => set((s) => ({ units: { ...s.units, precipitation: u } })),
      setWindSpeedUnit: (u) => set((s) => ({ units: { ...s.units, windSpeed: u } })),

      theme: 'auto',
      setTheme: (t) => set({ theme: t }),
    }),
    {
      name: 'weather-forecast-storage',
      partialize: (state) => ({
        apiKey: state.apiKey,
        units: state.units,
        theme: state.theme,
        location: state.location,
      }),
    },
  ),
)
