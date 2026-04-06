import { useWeatherStore } from '../../store/useWeatherStore'
import type { TemperatureUnit, PressureUnit, PrecipUnit, WindSpeedUnit } from '../../utils/units'
import styles from './Settings.module.css'

export function UnitSelector() {
  const units = useWeatherStore((s) => s.units)
  const setTemp = useWeatherStore((s) => s.setTemperatureUnit)
  const setPressure = useWeatherStore((s) => s.setPressureUnit)
  const setPrecip = useWeatherStore((s) => s.setPrecipUnit)
  const setWind = useWeatherStore((s) => s.setWindSpeedUnit)

  return (
    <div className={styles.unitSelector}>
      <div className={styles.unitGroup}>
        <label className={styles.unitLabel}>Temp</label>
        <select
          className={styles.unitSelect}
          value={units.temperature}
          onChange={(e) => setTemp(e.target.value as TemperatureUnit)}
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
          onChange={(e) => setWind(e.target.value as WindSpeedUnit)}
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
          onChange={(e) => setPrecip(e.target.value as PrecipUnit)}
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
          onChange={(e) => setPressure(e.target.value as PressureUnit)}
        >
          <option value="hPa">hPa</option>
          <option value="inHg">inHg</option>
        </select>
      </div>
    </div>
  )
}
