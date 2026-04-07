import { useWeatherStore } from '../../store/useWeatherStore'
import { DayCard } from './DayCard'
import styles from './DailyForecast.module.css'

/** Displays all 7 daily forecast cards in a grid aligned with the charts below. */
export function DailyForecast() {
  const forecast = useWeatherStore((s) => s.forecast)

  if (!forecast) return null

  return (
    <div className={styles.dailyForecast}>
      {forecast.daily.data.map((day) => (
        <DayCard key={day.time} day={day} />
      ))}
    </div>
  )
}
