import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import SunCalc from 'suncalc'
import { useWeatherStore } from '../../store/useWeatherStore'
import { makeNightMarkArea } from '../../utils/nightAreas'
import { makeTimeXAxis, makeTooltip, makeNowMarkLine, grid } from '../../utils/chartOptions'
import { useChartColors } from '../../hooks/useChartColors'
import { ChartContainer } from './ChartContainer'

const FIFTEEN_MIN_MS = 15 * 60 * 1000
const RAD_TO_DEG = 180 / Math.PI

export function SunChart() {
  const forecast = useWeatherStore((s) => s.forecast)
  const location = useWeatherStore((s) => s.location)
  const units = useWeatherStore((s) => s.units)
  const colors = useChartColors()

  /** Build the full ECharts option for the sun/UV/ozone chart. */
  const option = useMemo((): EChartsOption => {
    if (!forecast || !location) return {}

    const hourly = forecast.hourly.data
    const startMs = hourly[0].time * 1000
    const endMs = hourly[hourly.length - 1].time * 1000

    // Compute sun altitude at 15-minute intervals for a precise sinusoidal curve
    const altitudeRaw: [number, number][] = []
    for (let t = startMs; t <= endMs; t += FIFTEEN_MIN_MS) {
      const pos = SunCalc.getPosition(new Date(t), location.lat, location.lon)
      altitudeRaw.push([t, +(pos.altitude * RAD_TO_DEG).toFixed(1)])
    }

    // Split altitude into above/below horizon series for dual coloring.
    // Interpolate zero-crossing points so both series meet at the horizon.
    const aboveData: [number, number | null][] = []
    const belowData: [number, number | null][] = []
    for (let i = 0; i < altitudeRaw.length; i++) {
      const [t, alt] = altitudeRaw[i]
      if (i > 0) {
        const [prevT, prevAlt] = altitudeRaw[i - 1]
        if ((prevAlt >= 0 && alt < 0) || (prevAlt < 0 && alt >= 0)) {
          const fraction = Math.abs(prevAlt) / (Math.abs(prevAlt) + Math.abs(alt))
          const crossT = prevT + fraction * (t - prevT)
          aboveData.push([crossT, 0])
          belowData.push([crossT, 0])
        }
      }
      if (alt >= 0) {
        aboveData.push([t, alt])
        belowData.push([t, null])
      } else {
        aboveData.push([t, null])
        belowData.push([t, alt])
      }
    }

    // UV Index from hourly data
    const uvData = hourly.map((h) => [h.time * 1000, h.uvIndex])
    const uvMax = Math.max(1, ...hourly.map((h) => h.uvIndex))

    // Merge "now" mark line with a horizon zero-line
    const nowMarkLine = makeNowMarkLine() as { data: object[]; [k: string]: unknown }
    const mergedMarkLine = {
      ...nowMarkLine,
      data: [
        ...nowMarkLine.data,
        {
          yAxis: 0,
          lineStyle: { type: 'dashed' as const, color: '#9ca3af', width: 1 },
          label: { show: false },
        },
      ],
    }

    return {
      grid,
      tooltip: makeTooltip(),
      legend: {
        data: ['UV Index', 'Sun Altitude (°)'],
        bottom: 0,
        textStyle: { fontSize: 11, color: colors.labelColor },
        itemWidth: 16,
        itemHeight: 10,
        itemGap: 12,
      },
      xAxis: makeTimeXAxis(colors, units.timeFormat),
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: Math.ceil(uvMax + 1),
          axisLabel: { fontSize: 11, color: colors.labelColor },
          splitLine: { lineStyle: { type: 'dashed', color: colors.gridColor, opacity: 0.6 } },
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisTick: { lineStyle: { color: colors.axisLineColor } },
        },
        {
          type: 'value',
          position: 'right',
          axisLabel: { fontSize: 11, color: colors.labelColor, formatter: '{value}°' },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisTick: { lineStyle: { color: colors.axisLineColor } },
        },
      ],
      series: [
        {
          name: 'UV Index',
          type: 'line',
          yAxisIndex: 0,
          data: uvData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#ef4444', width: 1.5 },
          itemStyle: { color: '#ef4444' },
          areaStyle: { color: '#ef4444', opacity: 0.1 },
        },
        {
          name: 'Sun Altitude (°)',
          type: 'line',
          yAxisIndex: 1,
          data: aboveData as [number, number][],
          smooth: 0.3,
          symbol: 'none',
          connectNulls: false,
          lineStyle: { color: '#f59e0b', width: 2 },
          itemStyle: { color: '#f59e0b' },
          markLine: mergedMarkLine as never,
          markArea: makeNightMarkArea(forecast) as never,
        },
        {
          name: 'Sun Altitude (°)',
          type: 'line',
          yAxisIndex: 1,
          data: belowData as [number, number][],
          smooth: 0.3,
          symbol: 'none',
          connectNulls: false,
          lineStyle: { color: '#6d28d9', width: 2 },
          itemStyle: { color: '#6d28d9' },
        },
      ],
    }
  }, [forecast, location, units.timeFormat, colors])

  if (!forecast || !location) return null
  return <ChartContainer option={option} precision={0} />
}
