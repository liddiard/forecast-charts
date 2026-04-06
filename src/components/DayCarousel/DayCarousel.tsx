import { useWeatherStore } from '../../store/useWeatherStore'
import { DayCard } from './DayCard'
import styles from './DayCarousel.module.css'

export function DayCarousel() {
  const forecast = useWeatherStore((s) => s.forecast)
  const selectedDayIndex = useWeatherStore((s) => s.selectedDayIndex)
  const setSelectedDayIndex = useWeatherStore((s) => s.setSelectedDayIndex)

  if (!forecast) return null

  const days = forecast.daily.data
  const maxOffset = Math.max(0, days.length - 8)
  const offset = Math.min(selectedDayIndex, maxOffset)

  const scrollLeft = () => {
    if (offset > 0) setSelectedDayIndex(selectedDayIndex - 1)
  }

  const scrollRight = () => {
    if (selectedDayIndex < days.length - 1) setSelectedDayIndex(selectedDayIndex + 1)
  }

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselInner}>
        <button
          className={styles.arrow}
          onClick={scrollLeft}
          disabled={offset === 0}
          type="button"
          aria-label="Previous day"
        >
          ‹
        </button>
        <div className={styles.track}>
          <div
            className={styles.cards}
            style={{ transform: `translateX(-${offset * (100 / 7)}%)` }}
          >
            {days.map((day, i) => (
              <DayCard
                key={day.time}
                day={day}
                index={i}
                selected={i === selectedDayIndex}
                onClick={() => setSelectedDayIndex(i)}
              />
            ))}
          </div>
        </div>
        <button
          className={styles.arrow}
          onClick={scrollRight}
          disabled={selectedDayIndex >= days.length - 1}
          type="button"
          aria-label="Next day"
        >
          ›
        </button>
      </div>
    </div>
  )
}
