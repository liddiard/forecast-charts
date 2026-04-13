import { useCallback, useEffect, useRef } from 'react'
import { useWeatherStore } from '../../store/useWeatherStore'
import { formatHoverTime } from '../../utils/chartOptions'
import { TemperatureChart } from './TemperatureChart'
import { AtmosphereChart } from './AtmosphereChart'
import { PrecipitationChart } from './PrecipitationChart'
import { WindChart } from './WindChart'
import { SunChart } from './SunChart'
import styles from './Charts.module.css'

export function ForecastCharts() {
  const forecast = useWeatherStore((s) => s.forecast)
  const timeFormat = useWeatherStore((s) => s.units.timeFormat)
  const timeLabelRef = useRef<HTMLSpanElement>(null)
  const timeFormatRef = useRef(timeFormat)
  // Keep timeFormatRef in sync so the hover callback always uses the latest value
  useEffect(() => {
    timeFormatRef.current = timeFormat
  }, [timeFormat])

  /** Updates the floating hover time label directly via the DOM ref for performance. */
  const handleAxisHover = useCallback((time: number | null, pixelX: number) => {
    const el = timeLabelRef.current
    if (!el) return
    if (time === null) {
      el.style.display = 'none'
      return
    }
    el.textContent = formatHoverTime(time, timeFormatRef.current)
    el.style.display = 'block'
    el.style.left = `${pixelX}px`
  }, [])

  if (!forecast) return null

  return (
    <div className={styles.chartsContainer}>
      <span ref={timeLabelRef} className={styles.hoverTimeLabel} style={{ display: 'none' }} />
      <div className={styles.chartSection}>
        <TemperatureChart onAxisHover={handleAxisHover} />
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
