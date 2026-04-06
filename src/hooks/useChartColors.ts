import { useState, useEffect } from 'react'
import { useWeatherStore } from '../store/useWeatherStore'

export interface ChartColors {
  labelColor: string
  gridColor: string
  axisLineColor: string
  bgColor: string
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

const LIGHT: ChartColors = {
  labelColor: '#374151',
  gridColor: '#c5cdd5',
  axisLineColor: '#9ca3af',
  bgColor: '#ffffff',
}

const DARK: ChartColors = {
  labelColor: '#e5e7eb',
  gridColor: '#4b5563',
  axisLineColor: '#6b7280',
  bgColor: '#111827',
}

export function useChartColors(): ChartColors {
  const theme = useWeatherStore((s) => s.theme)
  const [systemDark, setSystemDark] = useState(getSystemDark)

  useEffect(() => {
    if (theme !== 'auto') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const isDark = theme === 'dark' || (theme === 'auto' && systemDark)
  return isDark ? DARK : LIGHT
}
