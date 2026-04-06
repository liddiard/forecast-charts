import { useState } from 'react'
import { useWeatherStore } from '../../store/useWeatherStore'
import { LocationSearch } from './LocationSearch'
import { SettingsModal } from '../Settings/SettingsModal'
import styles from './Header.module.css'

export function Header() {
  const apiKey = useWeatherStore((s) => s.apiKey)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <header className={styles.header}>
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
