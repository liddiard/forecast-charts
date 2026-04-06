import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertPressure } from '../../utils/units'
import { makeNightMarkArea } from '../../utils/nightAreas'
import {
  makeTimeXAxis,
  dataZoom,
  makeTooltip,
  makeNowMarkLine,
  grid,
} from '../../utils/chartOptions'
import { useChartColors } from '../../hooks/useChartColors'
import { ChartContainer } from './ChartContainer'

export function AtmosphereChart() {
  const forecast = useWeatherStore((s) => s.forecast)
  const units = useWeatherStore((s) => s.units)
  const colors = useChartColors()

  const option = useMemo((): EChartsOption => {
    if (!forecast) return {}

    const hourly = forecast.hourly.data
    const pressureLabel = units.pressure

    const cloudData = hourly.map((h) => [h.time * 1000, +(h.cloudCover * 100).toFixed(1)])
    const precipProbData = hourly.map((h) => [
      h.time * 1000,
      +(h.precipProbability * 100).toFixed(1),
    ])
    const humidityData = hourly.map((h) => [h.time * 1000, +(h.humidity * 100).toFixed(1)])
    const snowProbData = hourly.map((h) => [
      h.time * 1000,
      h.precipType === 'snow' ? +(h.precipProbability * 100).toFixed(1) : 0,
    ])
    const hasSnow = snowProbData.some((d) => (d[1] as number) > 0)

    const pressureValues = hourly.map((h) => convertPressure(h.pressure, units.pressure))
    const pressureData = hourly.map((h, i) => [h.time * 1000, +pressureValues[i].toFixed(2)])
    const pMin = Math.floor(Math.min(...pressureValues) - 2)
    const pMax = Math.ceil(Math.max(...pressureValues) + 2)

    // Pressure line: use a color that's visible in both light and dark modes
    const pressureColor = colors.labelColor === '#e5e7eb' ? '#94a3b8' : '#1f2937'

    return {
      grid,
      tooltip: makeTooltip(),
      legend: {
        data: [
          'Cloud Cover (%)',
          'Chance of Precip. (%)',
          ...(hasSnow ? ['Chance of Snow (%)'] : []),
          'Humidity (%)',
          `Pressure (${pressureLabel})`,
        ],
        bottom: 0,
        textStyle: { fontSize: 11, color: colors.labelColor },
        itemWidth: 16,
        itemHeight: 10,
        itemGap: 12,
      },
      xAxis: makeTimeXAxis(colors),
      yAxis: [
        {
          type: 'value',
          min: 0,
          max: 100,
          axisLabel: { fontSize: 11, color: colors.labelColor, formatter: '{value}%' },
          splitLine: { lineStyle: { type: 'dashed', color: colors.gridColor, opacity: 0.6 } },
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisTick: { lineStyle: { color: colors.axisLineColor } },
        },
        {
          type: 'value',
          position: 'right',
          min: pMin,
          max: pMax,
          axisLabel: { fontSize: 11, color: colors.labelColor, formatter: `{value}` },
          splitLine: { show: false },
          axisLine: { lineStyle: { color: colors.axisLineColor } },
          axisTick: { lineStyle: { color: colors.axisLineColor } },
        },
      ],
      dataZoom,
      series: [
        {
          name: 'Cloud Cover (%)',
          type: 'line',
          data: cloudData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#9ca3af', width: 1 },
          itemStyle: { color: '#9ca3af' },
          areaStyle: { color: '#9ca3af', opacity: 0.2 },
          markLine: makeNowMarkLine() as never,
          markArea: makeNightMarkArea(forecast) as never,
        },
        {
          name: 'Chance of Precip. (%)',
          type: 'line',
          data: precipProbData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#3b82f6', width: 1.5 },
          itemStyle: { color: '#3b82f6' },
          areaStyle: { color: '#3b82f6', opacity: 0.15 },
        },
        ...(hasSnow
          ? [
              {
                name: 'Chance of Snow (%)',
                type: 'line' as const,
                data: snowProbData,
                smooth: true,
                symbol: 'none',
                lineStyle: { color: '#ec4899', width: 1.5 },
                itemStyle: { color: '#ec4899' },
                areaStyle: { color: '#ec4899', opacity: 0.15 },
              },
            ]
          : []),
        {
          name: 'Humidity (%)',
          type: 'line',
          data: humidityData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#84cc16', width: 1.5 },
          itemStyle: { color: '#84cc16' },
        },
        {
          name: `Pressure (${pressureLabel})`,
          type: 'line',
          yAxisIndex: 1,
          data: pressureData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: pressureColor, width: 1.5 },
          itemStyle: { color: pressureColor },
        },
      ],
    }
  }, [forecast, units.pressure, colors])

  if (!forecast) return null
  return <ChartContainer option={option} />
}
