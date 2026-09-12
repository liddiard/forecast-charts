import type { DailyDataPoint } from '../../types/forecast'
import { getMeteoconSvgUrl } from '../../utils/iconMap'
import { convertTemp, convertPrecip, formatTemp, formatPrecip } from '../../utils/units'
import { formatZonedDay, formatZonedTime } from '../../utils/timezone'
import { useWeatherStore } from '../../store/useWeatherStore'
import styles from './DailyForecast.module.css'

interface DayCardProps {
  day: DailyDataPoint
  /** IANA timezone of the forecast location, used to render all times locally. */
  timezone: string
}

/** Renders a single day's forecast summary within the daily forecast grid. */
export function DayCard({ day, timezone }: DayCardProps) {
  const units = useWeatherStore((s) => s.units)
  const high = convertTemp(day.temperatureHigh, units.temperature)
  const low = convertTemp(day.temperatureLow, units.temperature)
  const precip =
    day.precipAccumulation != null ? convertPrecip(day.precipAccumulation, units.precipitation) : 0

  const dayName = formatZonedDay(day.time * 1000, timezone)
  const sunrise = formatZonedTime(day.sunriseTime * 1000, timezone, units.timeFormat)
  const sunset = formatZonedTime(day.sunsetTime * 1000, timezone, units.timeFormat)

  return (
    <div className={styles.card}>
      <p className={styles.dayName}>{dayName}</p>
      <p className={styles.temps}>
        <span className={styles.tempHigh}>{formatTemp(high, units.temperature)}</span>
        {' | '}
        <span className={styles.tempLow}>{formatTemp(low, units.temperature)}</span>
      </p>
      <div className={styles.iconWrap}>
        <img src={getMeteoconSvgUrl(day.icon)} alt={day.icon} width={48} height={48} />
      </div>
      <p className={styles.summary}>{day.summary.replace(/\.$/, '')}</p>
      <div className={styles.precipRow}>
        <img
          src={getMeteoconSvgUrl('raindrop')}
          alt="raindrop"
          width={16}
          height={16}
          className={styles.precipIcon}
        />
        <span>{formatPrecip(precip, units.precipitation)}</span>
      </div>
      <div className={styles.sunRow}>
        <img src={getMeteoconSvgUrl('sunrise')} alt="sunrise" className={styles.sunIcon} />
        <span>{sunrise}</span>–<span>{sunset}</span>
      </div>
    </div>
  )
}
