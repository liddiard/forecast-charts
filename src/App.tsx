import { useEffect } from 'react'
import { useWeatherStore } from './store/useWeatherStore'
import { useForecast } from './hooks/useForecast'
import { Header } from './components/Header/Header'
import { DayCarousel } from './components/DayCarousel/DayCarousel'
import { ForecastCharts } from './components/Charts/ForecastCharts'
import { SettingsContent } from './components/Settings/SettingsContent'
import settingsStyles from './components/Settings/Settings.module.css'
import styles from './App.module.css'

function useThemeEffect() {
  const theme = useWeatherStore((s) => s.theme)

  useEffect(() => {
    const applyTheme = (mode: 'light' | 'dark') => {
      document.documentElement.setAttribute('data-theme', mode)
    }

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      applyTheme(mq.matches ? 'dark' : 'light')
      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    } else {
      applyTheme(theme)
    }
  }, [theme])
}

function App() {
  useThemeEffect()
  useForecast()

  const forecast = useWeatherStore((s) => s.forecast)
  const loading = useWeatherStore((s) => s.loading)
  const error = useWeatherStore((s) => s.error)
  const apiKey = useWeatherStore((s) => s.apiKey)
  const location = useWeatherStore((s) => s.location)

  return (
    <>
      <Header />

      {!apiKey && (
        <div className={styles.welcome}>
          <h2 className={styles.welcomeTitle}>Weather Forecast</h2>
          <p className={styles.welcomeSubtitle}>
            Enter a{' '}
            <a href="https://pirateweather.net/" target="_blank" rel="noreferrer">
              Pirate Weather
            </a>{' '}
            API key below to get started.
          </p>
          <div className={settingsStyles.welcomeCard}>
            <SettingsContent />
          </div>
        </div>
      )}

      {apiKey && !location && (
        <div className={styles.emptyState}>
          <p>Search for a city or use your current location to load the forecast.</p>
        </div>
      )}

      {loading && (
        <div className={styles.emptyState}>
          <p>Loading forecast…</p>
        </div>
      )}

      {error && (
        <div className={styles.errorState}>
          <p>{error}</p>
        </div>
      )}

      {forecast && !loading && (
        <>
          <DayCarousel />
          <ForecastCharts />
        </>
      )}
    </>
  )
}

export default App
