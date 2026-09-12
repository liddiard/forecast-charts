import type { PirateWeatherResponse } from '../types/forecast'
import { toZonedMs } from './timezone'

type MarkAreaData = Array<[{ xAxis: number }, { xAxis: number }]>

function getNightMarkAreas(forecast: PirateWeatherResponse): MarkAreaData {
  const daily = forecast.daily.data
  if (daily.length === 0) return []

  const { timezone } = forecast
  const hourly = forecast.hourly.data
  // Shift instants into the location's wall clock to align with the chart x-axis
  const startMs = toZonedMs(hourly[0].time * 1000, timezone)
  const endMs = toZonedMs(hourly[hourly.length - 1].time * 1000, timezone)

  const areas: MarkAreaData = []

  // Night before the first sunrise
  const firstSunrise = toZonedMs(daily[0].sunriseTime * 1000, timezone)
  if (startMs < firstSunrise) {
    areas.push([{ xAxis: startMs }, { xAxis: firstSunrise }])
  }

  // Night after each day's sunset until the next sunrise (or end of range)
  for (let i = 0; i < daily.length; i++) {
    const sunset = toZonedMs(daily[i].sunsetTime * 1000, timezone)
    const nextSunrise =
      i + 1 < daily.length ? toZonedMs(daily[i + 1].sunriseTime * 1000, timezone) : endMs

    if (sunset < endMs) {
      areas.push([{ xAxis: sunset }, { xAxis: Math.min(nextSunrise, endMs) }])
    }
  }

  return areas
}

export function makeNightMarkArea(forecast: PirateWeatherResponse): object {
  return {
    silent: true,
    itemStyle: { color: 'rgba(109, 40, 217, 0.075)' },
    data: getNightMarkAreas(forecast),
  }
}
