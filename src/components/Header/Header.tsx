import { useMemo, useState } from 'react'
import { useWeatherStore } from '../../store/useWeatherStore'
import { LocationSearch } from './LocationSearch'
import { SettingsModal } from '../Settings/SettingsModal'
import styles from './Header.module.css'

/**
 * Formats a timestamp as a short locale date + time string,
 * e.g. "Apr 10, 16:49" (24h) or "Apr 10, 4:49 PM" (12h).
 */
const formatLastUpdated = (timestamp: number, use24h: boolean): string => {
  const date = new Date(timestamp)
  const datePart = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  const timePart = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h,
  })
  return `${datePart}, ${timePart}`
}

export function Header() {
  const apiKey = useWeatherStore((s) => s.apiKey)
  const lastFetchedAt = useWeatherStore((s) => s.lastFetchedAt)
  const timeFormat = useWeatherStore((s) => s.units.timeFormat)
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Format the last-updated timestamp using the user's 12/24h preference
  const lastUpdatedLabel = useMemo(
    () => (lastFetchedAt ? formatLastUpdated(lastFetchedAt, timeFormat === '24h') : null),
    [lastFetchedAt, timeFormat],
  )

  return (
    <header className={styles.header}>
      {lastUpdatedLabel && <span className={styles.lastUpdated}>Updated {lastUpdatedLabel}</span>}
      <LocationSearch />
      {apiKey && (
        <button className={styles.button} onClick={() => setSettingsOpen(true)} type="button">
          ⚙️ Settings
        </button>
      )}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  )
}
