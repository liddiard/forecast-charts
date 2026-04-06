import { ApiKeyInput } from './ApiKeyInput'
import { ThemeToggle } from './ThemeToggle'
import { UnitSelector } from './UnitSelector'
import styles from './Settings.module.css'

export function SettingsContent() {
  return (
    <div className={styles.settingsContent}>
      <div className={styles.section}>
        <ApiKeyInput />
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
        <UnitSelector />
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Theme</h3>
        <ThemeToggle showLabel={false} />
      </div>
    </div>
  )
}
