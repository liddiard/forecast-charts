import { useRef, useEffect, useCallback } from 'react'
import ReactECharts from 'echarts-for-react'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'
import styles from './Charts.module.css'
import { useChartColors } from '../../hooks/useChartColors'

/**
 * Finds the data point in a series whose x value is closest to the given xValue.
 * Handles both plain `[x, y]` arrays and `{ value: [x, y] }` object formats.
 * Returns null if no valid numeric point is found.
 */
function getClosestValue(
  rawData: unknown[],
  xValue: number,
): { bestX: number; bestY: number } | null {
  let bestX: number | null = null
  let bestY: number | null = null
  let minDist = Infinity

  for (const pt of rawData) {
    let x: number, y: number
    if (Array.isArray(pt)) {
      ;[x, y] = pt as [number, number]
    } else if (pt && typeof pt === 'object' && Array.isArray((pt as { value?: unknown }).value)) {
      ;[x, y] = (pt as { value: [number, number] }).value
    } else continue

    const d = Math.abs(x - xValue)
    if (d < minDist) {
      minDist = d
      bestX = x
      bestY = y
    }
  }

  if (bestX === null || bestY === null || !Number.isFinite(bestY)) return null
  return { bestX, bestY }
}

/**
 * Renders a single consolidated tooltip showing all series values for the hovered
 * x position. Values are sorted top-to-bottom by chart position and colored by
 * series color using ECharts rich text. Flips to the left side when the cursor
 * is near the right edge.
 *
 * @returns 1 if a tooltip was rendered, 0 otherwise.
 */
function renderInlineLabels(
  instance: echarts.ECharts,
  params: unknown,
  prevCount: number,
  bgColor: string,
  precision: number = 1,
): number {
  try {
    const p = params as { axesInfo?: Array<{ axisDim: string; value: number }> }
    if (!p.axesInfo?.length) return prevCount

    const xInfo = p.axesInfo.find((a) => a.axisDim === 'x')
    if (!xInfo) return prevCount

    const xValue = xInfo.value
    const opt = instance.getOption() as EChartsOption
    const seriesArr = Array.isArray(opt.series) ? opt.series : []
    const labels: { x: number; y: number; value: string; color: string }[] = []

    seriesArr.forEach((s, seriesIndex) => {
      const rawData = (s as { data?: unknown[] }).data
      if (!rawData?.length) return

      const closest = getClosestValue(rawData, xValue)
      if (!closest) return

      const pixel = instance.convertToPixel({ seriesIndex }, [closest.bestX, closest.bestY])
      if (!pixel || !Number.isFinite(pixel[0]) || !Number.isFinite(pixel[1])) return

      const color = (s as { itemStyle?: { color?: string } }).itemStyle?.color ?? '#374151'
      const factor = 10 ** precision
      const rounded = Math.round(closest.bestY * factor) / factor
      const displayVal =
        precision === 0
          ? String(Math.round(closest.bestY))
          : Number.isInteger(rounded)
            ? String(rounded)
            : rounded.toFixed(precision)

      // Extract unit from series name, e.g. "Temperature (°C)" → "°C"
      const name = (s as { name?: string }).name ?? ''
      const unitMatch = name.match(/\(([^)]+)\)/)
      const unit = unitMatch ? ` ${unitMatch[1]}` : ''

      labels.push({ x: pixel[0], y: pixel[1], value: displayVal + unit, color })
    })

    if (!labels.length) return 0

    // Sort top to bottom by vertical position on the chart
    labels.sort((a, b) => a.y - b.y)

    const chartWidth = instance.getWidth()
    const showOnLeft = (labels[0]?.x ?? chartWidth / 2) > chartWidth * 0.75
    const xOffset = showOnLeft ? -10 : 10
    const textAlign = showOnLeft ? 'right' : 'left'

    // Parse bgColor hex to rgba with 80% opacity for label background
    const r = parseInt(bgColor.slice(1, 3), 16)
    const g = parseInt(bgColor.slice(3, 5), 16)
    const b = parseInt(bgColor.slice(5, 7), 16)
    const bgRgba = `rgba(${r},${g},${b},0.8)`

    // Build rich text: each series value gets its own color style
    const rich: Record<
      string,
      { fill: string; fontSize: number; fontWeight: string; lineHeight: number }
    > = {}
    const textParts: string[] = []
    labels.forEach((l, i) => {
      const key = `s${i}`
      rich[key] = { fill: l.color, fontSize: 12, fontWeight: 'bold', lineHeight: 18 }
      textParts.push(`{${key}|${l.value}}`)
    })

    // Vertically center the tooltip within the chart grid area
    const gridOpt = (Array.isArray(opt.grid) ? opt.grid[0] : opt.grid) as
      | { top?: number; bottom?: number }
      | undefined
    const gridTop = gridOpt?.top ?? 16
    const gridBottom = gridOpt?.bottom ?? 52
    const tooltipHeight = labels.length * 18
    const yPos = (gridTop + (instance.getHeight() - gridBottom)) / 2 - tooltipHeight / 2

    instance.setOption({
      graphic: [
        {
          id: 'hl-tooltip',
          type: 'text',
          $action: 'replace',
          x: labels[0].x + xOffset,
          y: yPos,
          style: {
            text: textParts.join('\n'),
            rich,
            textAlign,
            textBaseline: 'middle',
            backgroundColor: bgRgba,
            padding: [2, 4],
            borderRadius: 3,
          },
          z: 100,
        },
      ],
    })
    return 1
  } catch {
    return prevCount
  }
}

/**
 * Removes the consolidated inline tooltip rendered by `renderInlineLabels`.
 * No-ops if `count` is 0 to avoid unnecessary `setOption` calls.
 */
function clearInlineLabels(instance: echarts.ECharts, count: number) {
  if (count === 0) return
  instance.setOption({ graphic: [{ id: 'hl-tooltip', $action: 'remove' }] })
}

const GROUP_ID = 'forecast'

/** Shared registry of all connected chart instances and their current label counts. */
const connectedCharts = new Map<echarts.ECharts, { labelCount: number }>()

export type AxisHoverHandler = (time: number | null, pixelX: number) => void

interface ChartContainerProps {
  option: EChartsOption
  theme?: string
  className?: string
  /** Number of decimal places shown in inline tooltip labels (default: 1). */
  precision?: number
  onAxisHover?: AxisHoverHandler
}

export function ChartContainer({
  option,
  theme,
  className,
  precision = 1,
  onAxisHover,
}: ChartContainerProps) {
  const chartRef = useRef<ReactECharts>(null)
  const { bgColor } = useChartColors()
  const bgColorRef = useRef(bgColor)
  const precisionRef = useRef(precision)
  const onAxisHoverRef = useRef(onAxisHover)
  // Keep refs in sync so callbacks capture the latest value without re-registering
  useEffect(() => {
    bgColorRef.current = bgColor
  }, [bgColor])
  useEffect(() => {
    precisionRef.current = precision
  }, [precision])
  useEffect(() => {
    onAxisHoverRef.current = onAxisHover
  }, [onAxisHover])

  const onChartReady = useCallback((instance: echarts.ECharts) => {
    instance.group = GROUP_ID
    echarts.connect(GROUP_ID)

    const state = { labelCount: 0 }
    connectedCharts.set(instance, state)

    function handleAxisPointerUpdate(params: unknown) {
      state.labelCount = renderInlineLabels(
        instance,
        params,
        state.labelCount,
        bgColorRef.current,
        precisionRef.current,
      )

      if (onAxisHoverRef.current) {
        const p = params as { axesInfo?: Array<{ axisDim: string; value: number }> }
        const xInfo = p.axesInfo?.find((a) => a.axisDim === 'x')
        if (xInfo) {
          // Use seriesIndex finder (consistent with renderInlineLabels) and a
          // dummy Y of 0 — we only need the resulting pixel X coordinate.
          const pixel = instance.convertToPixel({ seriesIndex: 0 }, [xInfo.value, 0])
          if (pixel && Number.isFinite(pixel[0])) {
            onAxisHoverRef.current(xInfo.value, pixel[0])
          }
        }
      }
    }

    /** Clear tooltips on ALL connected charts, not just the one the mouse left. */
    function handleGlobalOut() {
      for (const [chart, s] of connectedCharts) {
        clearInlineLabels(chart, s.labelCount)
        s.labelCount = 0
      }
      onAxisHoverRef.current?.(null, 0)
    }

    instance.on('updateAxisPointer', handleAxisPointerUpdate)
    instance.on('globalout', handleGlobalOut)
  }, [])

  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance()
    if (instance) {
      instance.group = GROUP_ID
      echarts.connect(GROUP_ID)
    }
    // Remove chart from shared registry on unmount
    return () => {
      if (instance) connectedCharts.delete(instance)
    }
  }, [])

  return (
    <div className={className ?? styles.chart}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '100%' }}
        theme={theme}
        onChartReady={onChartReady}
        notMerge
      />
    </div>
  )
}
