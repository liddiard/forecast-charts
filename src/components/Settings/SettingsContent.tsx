import { useState } from 'react'
import { useWeatherStore, type ThemeMode } from '../../store/useWeatherStore'
import type { UnitPreferences } from '../../utils/units'
import { ApiKeyInput } from './ApiKeyInput'
import { ThemeToggle } from './ThemeToggle'
import { UnitSelector } from './UnitSelector'
import styles from './Settings.module.css'

interface Props {
  onSave?: () => void
}

/** Manages draft state for all settings, committing to the store only on Save. */
export function SettingsContent({ onSave }: Props = {}) {
  const storeApiKey = useWeatherStore((s) => s.apiKey)
  const storeUnits = useWeatherStore((s) => s.units)
  const storeTheme = useWeatherStore((s) => s.theme)
  const setApiKey = useWeatherStore((s) => s.setApiKey)
  const setTemperatureUnit = useWeatherStore((s) => s.setTemperatureUnit)
  const setPressureUnit = useWeatherStore((s) => s.setPressureUnit)
  const setPrecipUnit = useWeatherStore((s) => s.setPrecipUnit)
  const setWindSpeedUnit = useWeatherStore((s) => s.setWindSpeedUnit)
  const setTheme = useWeatherStore((s) => s.setTheme)

  const [apiKey, setDraftApiKey] = useState(storeApiKey ?? '')
  const [units, setUnits] = useState<UnitPreferences>(storeUnits)
  const [theme, setDraftTheme] = useState<ThemeMode>(storeTheme)

  /** Commits all draft values to the store. */
  const handleSave = () => {
    const trimmed = apiKey.trim()
    if (trimmed) setApiKey(trimmed)
    setTemperatureUnit(units.temperature)
    setPressureUnit(units.pressure)
    setPrecipUnit(units.precipitation)
    setWindSpeedUnit(units.windSpeed)
    setTheme(theme)
    onSave?.()
  }

  return (
    <div className={styles.settingsContent}>
      <div className={styles.section}>
        <ApiKeyInput value={apiKey} onChange={setDraftApiKey} />
        <p className={styles.sectionHint}>
          Get a free key at{' '}
          <a href="https://pirateweather.net/" target="_blank" rel="noreferrer">
            pirateweather.net
          </a>
          . Your key is stored only in your browser and never sent anywhere else.
        </p>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Units</h3>
        <UnitSelector units={units} onChange={setUnits} />
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Theme</h3>
        <ThemeToggle value={theme} onChange={setDraftTheme} showLabel={false} />
      </div>
      <button className={styles.saveButton} onClick={handleSave} type="button">
        Save
      </button>
    </div>
  )
}
