import { useWeatherStore } from '../../store/useWeatherStore'
import { TemperatureChart } from './TemperatureChart'
import { AtmosphereChart } from './AtmosphereChart'
import { PrecipitationChart } from './PrecipitationChart'
import { WindChart } from './WindChart'
import { SunChart } from './SunChart'
import styles from './Charts.module.css'

export function ForecastCharts() {
  const forecast = useWeatherStore((s) => s.forecast)

  if (!forecast) return null

  return (
    <div className={styles.chartsContainer}>
      <div className={styles.chartSection}>
        <TemperatureChart />
      </div>
      <div className={styles.chartSection}>
        <AtmosphereChart />
      </div>
      <div className={styles.chartSection}>
        <PrecipitationChart />
      </div>
      <div className={styles.chartSection}>
        <WindChart />
      </div>
      <div className={styles.chartSection}>
        <SunChart />
      </div>
    </div>
  )
}
