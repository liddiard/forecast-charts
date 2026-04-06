import { useWeatherStore, type ThemeMode } from '../../store/useWeatherStore'
import styles from './Settings.module.css'

const options: { value: ThemeMode; label: string; title?: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'auto', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
]

export function ThemeToggle({ showLabel = true }: { showLabel?: boolean }) {
  const theme = useWeatherStore((s) => s.theme)
  const setTheme = useWeatherStore((s) => s.setTheme)

  return (
    <div className={styles.themeGroup}>
      {showLabel && <span className={styles.themeLabel}>Theme</span>}
      <div className={styles.themeToggle}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.themeButton} ${theme === opt.value ? styles.themeButtonActive : ''}`}
            onClick={() => setTheme(opt.value)}
            title={opt.title}
            type="button"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
