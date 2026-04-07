import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertPrecip } from '../../utils/units'
import { makeNightMarkArea } from '../../utils/nightAreas'
import {
  makeTimeXAxis,
  makeYAxis,
  makeTooltip,
  makeNowMarkLine,
  makeLegend,
  grid,
} from '../../utils/chartOptions'
import { useChartColors } from '../../hooks/useChartColors'
import { ChartContainer } from './ChartContainer'
import styles from './Charts.module.css'

export function PrecipitationChart() {
  const forecast = useWeatherStore((s) => s.forecast)
  const units = useWeatherStore((s) => s.units)
  const colors = useChartColors()

  const option = useMemo((): EChartsOption => {
    if (!forecast) return {}

    const hourly = forecast.hourly.data
    const precipLabel = units.precipitation

    const accumData = hourly.map((h) => [
      h.time * 1000,
      h.precipAccumulation != null
        ? +convertPrecip(h.precipAccumulation, units.precipitation).toFixed(2)
        : 0,
    ])
    const intensityData = hourly.map((h) => [
      h.time * 1000,
      +convertPrecip(h.precipIntensity, units.precipitation).toFixed(2),
    ])

    const dataMax = Math.max(
      0,
      ...accumData.map(([, v]) => v as number),
      ...intensityData.map(([, v]) => v as number),
    )
    // Round max up to nearest 0.1, minimum 0.1 so axis is always meaningful
    const yMax = Math.max(0.1, Math.ceil(dataMax * 10) / 10)
    // Aim for ~5 ticks, but never finer than 0.1 increments
    const yInterval = Math.max(0.1, Math.round((yMax / 5) * 10) / 10)

    return {
      grid,
      tooltip: makeTooltip(),
      legend: makeLegend(
        [`Precip. Accum. Total (${precipLabel})`, `Hourly Liquid Precip. (${precipLabel})`],
        colors,
      ),
      xAxis: makeTimeXAxis(colors, units.timeFormat),
      yAxis: makeYAxis(colors, {
        min: 0,
        max: yMax,
        interval: yInterval,
        axisLabel: {
          fontSize: 11,
          color: colors.labelColor,
          formatter: (value: number) => `${+value.toFixed(1)} ${precipLabel}`,
        },
      }),
      series: [
        {
          name: `Precip. Accum. Total (${precipLabel})`,
          type: 'bar',
          data: accumData,
          itemStyle: { color: '#93c5fd' },
          barMaxWidth: 8,
          markLine: makeNowMarkLine() as never,
          markArea: makeNightMarkArea(forecast) as never,
        },
        {
          name: `Hourly Liquid Precip. (${precipLabel})`,
          type: 'bar',
          data: intensityData,
          itemStyle: { color: '#22c55e' },
          barMaxWidth: 8,
        },
      ],
    }
  }, [forecast, units.precipitation, units.timeFormat, colors])

  if (!forecast) return null
  return <ChartContainer option={option} className={styles.chartPrecipitation} />
}
