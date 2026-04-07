import { format } from 'date-fns'
import type { DailyDataPoint } from '../../types/forecast'
import { WeatherIcon } from '../WeatherIcon/WeatherIcon'
import { convertTemp, convertPrecip, formatTemp, formatPrecip } from '../../utils/units'
import { useWeatherStore } from '../../store/useWeatherStore'
import styles from './DailyForecast.module.css'

interface DayCardProps {
  day: DailyDataPoint
}

/** Renders a single day's forecast summary within the daily forecast grid. */
export function DayCard({ day }: DayCardProps) {
  const units = useWeatherStore((s) => s.units)
  const date = new Date(day.time * 1000)
  const high = convertTemp(day.temperatureHigh, units.temperature)
  const low = convertTemp(day.temperatureLow, units.temperature)
  const precip =
    day.precipAccumulation != null ? convertPrecip(day.precipAccumulation, units.precipitation) : 0

  const timeFmt = units.timeFormat === '24h' ? 'H:mm' : 'h:mm a'
  const sunrise = format(new Date(day.sunriseTime * 1000), timeFmt)
  const sunset = format(new Date(day.sunsetTime * 1000), timeFmt)

  return (
    <div className={styles.card}>
      <p className={styles.dayName}>{format(date, 'EEE M/d')}</p>
      <p className={styles.temps}>
        <span className={styles.tempHigh}>{formatTemp(high, units.temperature)}</span>
        {' | '}
        <span className={styles.tempLow}>{formatTemp(low, units.temperature)}</span>
      </p>
      <div className={styles.iconWrap}>
        <WeatherIcon icon={day.icon} size={48} />
      </div>
      <p className={styles.summary}>{day.summary}</p>
      <div className={styles.precipRow}>
        <WeatherIcon icon="raindrop" size={16} className={styles.precipIcon} />
        <span>{formatPrecip(precip, units.precipitation)}</span>
      </div>
      <div className={styles.sunRow}>
        <img
          src={
            new URL(
              `../../../node_modules/@bybas/weather-icons/production/fill/all/sunrise.svg`,
              import.meta.url,
            ).href
          }
          alt="sunrise"
          className={styles.sunIcon}
        />
        <span>{sunrise}</span>
        <img
          src={
            new URL(
              `../../../node_modules/@bybas/weather-icons/production/fill/all/sunset.svg`,
              import.meta.url,
            ).href
          }
          alt="sunset"
          className={styles.sunIcon}
        />
        <span>{sunset}</span>
      </div>
    </div>
  )
}
