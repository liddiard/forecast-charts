import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertWindSpeed } from '../../utils/units'
import { makeNightMarkArea } from '../../utils/nightAreas'
import {
  makeTimeXAxis,
  makeYAxis,
  dataZoom,
  makeTooltip,
  makeNowMarkLine,
  makeLegend,
  grid,
  formatTooltipTime,
} from '../../utils/chartOptions'
import { useChartColors } from '../../hooks/useChartColors'
import { ChartContainer } from './ChartContainer'

export function WindChart() {
  const forecast = useWeatherStore((s) => s.forecast)
  const units = useWeatherStore((s) => s.units)
  const colors = useChartColors()

  const option = useMemo((): EChartsOption => {
    if (!forecast) return {}

    const hourly = forecast.hourly.data
    const windLabel = units.windSpeed

    // Elongated arrow centered on origin: tip at top (0,-5), base corners at (±2,5), notch at (0,2)
    const arrowPath = 'path://M 0,-5 L 2,5 L 0,2 L -2,5 Z'
    const windData = hourly.map((h) => {
      const hour = new Date(h.time * 1000).getHours()
      const showArrow = hour % 3 === 0
      return {
        value: [h.time * 1000, +convertWindSpeed(h.windSpeed, units.windSpeed).toFixed(1)],
        symbol: showArrow ? arrowPath : 'none',
        symbolSize: 14,
        symbolRotate: (h.windBearing + 180) % 360,
        itemStyle: showArrow ? { borderColor: colors.bgColor, borderWidth: 1.5 } : undefined,
      }
    })

    const gustData = hourly.map((h) => [
      h.time * 1000,
      +convertWindSpeed(h.windGust, units.windSpeed).toFixed(1),
    ])

    return {
      grid,
      tooltip: {
        ...makeTooltip(),
        formatter: (params: unknown) => {
          if (!Array.isArray(params) || params.length === 0) return ''
          const p = params[0] as { value: [number, number]; data: { symbolRotate: number } }
          const timeStr = formatTooltipTime(p.value[0])
          const speed = Math.round(p.value[1])
          const bearing = (p.data.symbolRotate + 180) % 360
          const directions = [
            'N',
            'NNE',
            'NE',
            'ENE',
            'E',
            'ESE',
            'SE',
            'SSE',
            'S',
            'SSW',
            'SW',
            'WSW',
            'W',
            'WNW',
            'NW',
            'NNW',
          ]
          const dir = directions[Math.round(bearing / 22.5) % 16]
          const gustParam = (params as { seriesName: string; value: [number, number] }[]).find(
            (p) => p.seriesName === 'Wind Gust',
          )
          const gustStr = gustParam
            ? `<br/>Wind Gust: ${Math.round(gustParam.value[1])} ${windLabel}`
            : ''
          return `<strong>${timeStr}</strong><br/>Wind Speed: ${speed} ${windLabel} from ${dir}${gustStr}`
        },
      },
      legend: makeLegend(['Wind Speed', 'Wind Gust'], colors),
      xAxis: makeTimeXAxis(colors),
      yAxis: makeYAxis(colors, {
        min: 0,
        name: windLabel,
        nameTextStyle: { fontSize: 11, color: colors.labelColor },
      }),
      dataZoom,
      series: [
        {
          name: 'Wind Speed',
          type: 'line',
          data: windData,
          smooth: false,
          lineStyle: { color: '#3b82f6', width: 1.5 },
          itemStyle: { color: '#3b82f6' },
          markLine: makeNowMarkLine() as never,
          markArea: makeNightMarkArea(forecast) as never,
        },
        {
          name: 'Wind Gust',
          type: 'line',
          data: gustData,
          smooth: false,
          symbol: 'none',
          lineStyle: { color: '#9ca3af', width: 1.5, type: 'dotted' },
          itemStyle: { color: '#9ca3af' },
        },
      ],
    }
  }, [forecast, units.windSpeed, colors])

  if (!forecast) return null
  return <ChartContainer option={option} />
}
