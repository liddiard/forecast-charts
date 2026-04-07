import { useRef, useEffect, useCallback, useState } from 'react'
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
      const rounded = Math.round(closest.bestY * 10) / 10
      const displayVal = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)

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

interface ChartContainerProps {
  option: EChartsOption
  theme?: string
  className?: string
}

export function ChartContainer({ option, theme, className }: ChartContainerProps) {
  const chartRef = useRef<ReactECharts>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [showHint, setShowHint] = useState(false)
  const { bgColor } = useChartColors()
  const bgColorRef = useRef(bgColor)
  // Keep bgColorRef in sync so callbacks capture the latest value without re-registering
  useEffect(() => {
    bgColorRef.current = bgColor
  }, [bgColor])

  const onChartReady = useCallback((instance: echarts.ECharts) => {
    instance.group = GROUP_ID
    echarts.connect(GROUP_ID)

    let labelCount = 0

    function handleAxisPointerUpdate(params: unknown) {
      labelCount = renderInlineLabels(instance, params, labelCount, bgColorRef.current)
    }

    function handleGlobalOut() {
      clearInlineLabels(instance, labelCount)
      labelCount = 0
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
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Let ECharts receive the event and handle zooming
        return
      }

      // No modifier held: stop the event reaching ECharts so it can't call
      // preventDefault() and block the page scroll. Since we never call
      // preventDefault() ourselves, the browser scrolls the page normally.
      e.stopPropagation()

      setShowHint(true)
      clearTimeout(hintTimerRef.current)
      hintTimerRef.current = setTimeout(() => setShowHint(false), 2000)
    }

    // Capture phase fires before ECharts' listeners on the canvas child.
    // passive: true — we never call preventDefault, so the scroll is never blocked.
    container.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: true,
    })
    return () => {
      container.removeEventListener('wheel', handleWheel, { capture: true })
      clearTimeout(hintTimerRef.current)
    }
  }, [])

  return (
    <div ref={containerRef} className={className ?? styles.chart} style={{ position: 'relative' }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '100%' }}
        theme={theme}
        onChartReady={onChartReady}
        notMerge
      />
      {showHint && (
        <div className={styles.scrollHint}>
          Use <kbd>Ctrl</kbd> + scroll to zoom
        </div>
      )}
    </div>
  )
}
