import { useState } from 'react'
import styles from './Settings.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

/** Controlled API key input with local visibility toggle. */
export function ApiKeyInput({ value, onChange }: Props) {
  const [visible, setVisible] = useState(false)

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
          onChange={(e) => onChange(e.target.value)}
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
