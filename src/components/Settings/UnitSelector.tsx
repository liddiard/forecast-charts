import type {
  UnitPreferences,
  TemperatureUnit,
  PressureUnit,
  PrecipUnit,
  WindSpeedUnit,
} from '../../utils/units'
import styles from './Settings.module.css'

interface Props {
  units: UnitPreferences
  onChange: (units: UnitPreferences) => void
}

/** Controlled unit selector — calls onChange with a new UnitPreferences object on each change. */
export function UnitSelector({ units, onChange }: Props) {
  return (
    <div className={styles.unitSelector}>
      <div className={styles.unitGroup}>
        <label className={styles.unitLabel}>Temp</label>
        <select
          className={styles.unitSelect}
          value={units.temperature}
          onChange={(e) => onChange({ ...units, temperature: e.target.value as TemperatureUnit })}
        >
          <option value="C">°C</option>
          <option value="F">°F</option>
        </select>
      </div>
      <div className={styles.unitGroup}>
        <label className={styles.unitLabel}>Wind</label>
        <select
          className={styles.unitSelect}
          value={units.windSpeed}
          onChange={(e) => onChange({ ...units, windSpeed: e.target.value as WindSpeedUnit })}
        >
          <option value="km/h">km/h</option>
          <option value="mph">mph</option>
          <option value="m/s">m/s</option>
          <option value="knots">knots</option>
        </select>
      </div>
      <div className={styles.unitGroup}>
        <label className={styles.unitLabel}>Precip</label>
        <select
          className={styles.unitSelect}
          value={units.precipitation}
          onChange={(e) => onChange({ ...units, precipitation: e.target.value as PrecipUnit })}
        >
          <option value="mm">mm</option>
          <option value="in">in</option>
        </select>
      </div>
      <div className={styles.unitGroup}>
        <label className={styles.unitLabel}>Pressure</label>
        <select
          className={styles.unitSelect}
          value={units.pressure}
          onChange={(e) => onChange({ ...units, pressure: e.target.value as PressureUnit })}
        >
          <option value="hPa">hPa</option>
          <option value="inHg">inHg</option>
        </select>
      </div>
    </div>
  )
}
