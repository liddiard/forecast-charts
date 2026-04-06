import type { ThemeMode } from '../../store/useWeatherStore'
import styles from './Settings.module.css'

const options: { value: ThemeMode; label: string; title?: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'auto', label: 'Auto' },
  { value: 'dark', label: 'Dark' },
]

interface Props {
  value: ThemeMode
  onChange: (t: ThemeMode) => void
  showLabel?: boolean
}

/** Controlled theme toggle button group. */
export function ThemeToggle({ value, onChange, showLabel = true }: Props) {
  return (
    <div className={styles.themeGroup}>
      {showLabel && <span className={styles.themeLabel}>Theme</span>}
      <div className={styles.themeToggle}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.themeButton} ${value === opt.value ? styles.themeButtonActive : ''}`}
            onClick={() => onChange(opt.value)}
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
