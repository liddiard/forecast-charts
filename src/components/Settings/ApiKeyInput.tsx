import { useState } from 'react'
import { useWeatherStore } from '../../store/useWeatherStore'
import styles from './Settings.module.css'

export function ApiKeyInput() {
  const apiKey = useWeatherStore((s) => s.apiKey)
  const setApiKey = useWeatherStore((s) => s.setApiKey)
  const [value, setValue] = useState(apiKey ?? '')
  const [visible, setVisible] = useState(false)

  const handleSave = () => {
    const trimmed = value.trim()
    if (trimmed) setApiKey(trimmed)
  }

  return (
    <div className={styles.inputGroup}>
      <label className={`${styles.label} ${styles.lg}`} htmlFor="api-key">
        API Key
      </label>
      <div className={styles.inputRow}>
        <input
          id="api-key"
          name="api-key"
          type={visible ? 'text' : 'password'}
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Pirate Weather API key"
          spellCheck={false}
          autoComplete="off"
        />
        <button
          className={styles.button}
          onClick={() => setVisible(!visible)}
          title={visible ? 'Hide key' : 'Show key'}
          type="button"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
    </div>
  )
}
