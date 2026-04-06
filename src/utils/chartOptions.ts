import type { EChartsOption } from 'echarts'
import type { ChartColors } from '../hooks/useChartColors'

const DEFAULT_COLORS: ChartColors = {
  labelColor: '#374151',
  gridColor: '#c5cdd5',
  axisLineColor: '#9ca3af',
  bgColor: '#ffffff',
}

export function makeTimeXAxis(colors: ChartColors = DEFAULT_COLORS): EChartsOption['xAxis'] {
  return {
    type: 'time',
    axisLabel: {
      fontSize: 11,
      color: colors.labelColor,
      formatter: {
        year: '{yyyy}',
        month: '{MMM} {yyyy}',
        day: '{MMM} {d}',
        hour: '{MMM} {d}\n{HH}:{mm}',
        minute: '{HH}:{mm}',
        second: '{HH}:{mm}:{ss}',
        millisecond: '{HH}:{mm}:{ss}',
      },
    },
    splitLine: {
      show: true,
      lineStyle: { type: 'dashed', color: colors.gridColor, opacity: 0.6 },
    },
    axisLine: { lineStyle: { color: colors.axisLineColor } },
    axisTick: { lineStyle: { color: colors.axisLineColor } },
  }
}

export function makeYAxis(
  colors: ChartColors = DEFAULT_COLORS,
  overrides: object = {},
): EChartsOption['yAxis'] {
  return {
    type: 'value',
    axisLabel: { fontSize: 11, color: colors.labelColor },
    splitLine: { lineStyle: { type: 'dashed', color: colors.gridColor, opacity: 0.6 } },
    axisLine: { lineStyle: { color: colors.axisLineColor } },
    axisTick: { lineStyle: { color: colors.axisLineColor } },
    ...overrides,
  } as EChartsOption['yAxis']
}

export const dataZoom: EChartsOption['dataZoom'] = [
  {
    type: 'inside',
    xAxisIndex: 0,
    filterMode: 'none',
    // Always zoom when ECharts receives a wheel event. Our capture-phase
    // listener in ChartContainer ensures ECharts only receives wheel events
    // when Ctrl or Cmd is held, so this is safe.
    zoomOnMouseWheel: true,
    moveOnMouseMove: true,
    moveOnMouseWheel: false,
  },
]

function formatTooltipTime(ms: number): string {
  const d = new Date(ms)
  const month = d.toLocaleString(undefined, { month: 'short' })
  const day = d.getDate()
  const hour = d.getHours()
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${month} ${day}, ${h12}:00 ${ampm}`
}

export function makeTooltip(): EChartsOption['tooltip'] {
  return {
    trigger: 'axis',
    showContent: false, // hide tooltip box; inline graphic labels handle display
    axisPointer: {
      type: 'line',
      lineStyle: { color: '#94a3b8', type: 'dashed', width: 1 },
    },
  }
}

export { formatTooltipTime }

export function makeNowMarkLine(): object {
  return {
    silent: true,
    symbol: 'none',
    lineStyle: { type: 'dashed', color: '#f59e0b', width: 2 },
    data: [{ xAxis: Date.now() }],
    label: { show: false },
  }
}

export function makeLegend(
  names: string[],
  colors: ChartColors = DEFAULT_COLORS,
): EChartsOption['legend'] {
  return {
    data: names,
    bottom: 0,
    textStyle: { fontSize: 11, color: colors.labelColor },
    itemWidth: 16,
    itemHeight: 10,
    itemGap: 12,
  }
}

export const grid: EChartsOption['grid'] = {
  left: 50,
  right: 50,
  top: 16,
  bottom: 52, // x-axis labels ~20px + legend ~22px + padding
  containLabel: false,
}
