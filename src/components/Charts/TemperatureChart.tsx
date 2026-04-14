import { useMemo } from 'react'
import type { EChartsOption } from 'echarts'
import { useWeatherStore } from '../../store/useWeatherStore'
import { convertTemp } from '../../utils/units'
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
import { ChartContainer, type AxisHoverHandler } from './ChartContainer'

interface TemperatureChartProps {
  onAxisHover?: AxisHoverHandler
}

export function TemperatureChart({ onAxisHover }: TemperatureChartProps) {
  const forecast = useWeatherStore((s) => s.forecast)
  const units = useWeatherStore((s) => s.units)
  const colors = useChartColors()

  const option = useMemo((): EChartsOption => {
    if (!forecast) return {}

    const hourly = forecast.hourly.data
    const unitLabel = `°${units.temperature}`

    const tempData = hourly.map((h) => [
      h.time * 1000,
      convertTemp(h.temperature, units.temperature),
    ])
    const feelsData = hourly.map((h) => [
      h.time * 1000,
      convertTemp(h.apparentTemperature, units.temperature),
    ])
    const dewData = hourly.map((h) => [h.time * 1000, convertTemp(h.dewPoint, units.temperature)])

    return {
      grid,
      tooltip: makeTooltip(),
      legend: makeLegend(
        [`Temperature (${unitLabel})`, `Feels Like (${unitLabel})`, `Dew Point (${unitLabel})`],
        colors,
      ),
      xAxis: makeTimeXAxis(colors, units.timeFormat),
      yAxis: makeYAxis(colors, {
        axisLabel: {
          fontSize: 11,
          color: colors.labelColor,
          formatter: `{value} ${unitLabel}`,
        },
      }),
      series: [
        {
          name: `Feels Like (${unitLabel})`,
          type: 'line',
          data: feelsData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#8a31d4', width: 1.5 },
          itemStyle: { color: '#8a31d4' },
          markArea: makeNightMarkArea(forecast) as never,
        },
        {
          name: `Dew Point (${unitLabel})`,
          type: 'line',
          data: dewData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#00a53f', width: 1.5 },
          itemStyle: { color: '#00a53f' },
        },
        {
          name: `Temperature (${unitLabel})`,
          type: 'line',
          data: tempData,
          smooth: true,
          symbol: 'none',
          lineStyle: { color: '#ef4444', width: 1.5 },
          itemStyle: { color: '#ef4444' },
          markLine: makeNowMarkLine() as never,
        },
      ],
    }
  }, [forecast, units.temperature, units.timeFormat, colors])

  if (!forecast) return null
  return <ChartContainer option={option} precision={0} onAxisHover={onAxisHover} />
}
