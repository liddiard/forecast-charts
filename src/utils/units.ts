export type TemperatureUnit = 'C' | 'F'
export type PressureUnit = 'hPa' | 'inHg'
export type PrecipUnit = 'mm' | 'in'
export type WindSpeedUnit = 'km/h' | 'mph' | 'm/s' | 'knots'
export type TimeFormat = '12h' | '24h'

export interface UnitPreferences {
  temperature: TemperatureUnit
  pressure: PressureUnit
  precipitation: PrecipUnit
  windSpeed: WindSpeedUnit
  timeFormat: TimeFormat
}

export const DEFAULT_UNITS: UnitPreferences = {
  temperature: 'C',
  pressure: 'hPa',
  precipitation: 'mm',
  windSpeed: 'km/h',
  timeFormat: '12h',
}

export function convertTemp(celsius: number, to: TemperatureUnit): number {
  if (to === 'F') return (celsius * 9) / 5 + 32
  return celsius
}

export function convertPressure(hPa: number, to: PressureUnit): number {
  if (to === 'inHg') return hPa * 0.02953
  return hPa
}

export function convertPrecip(mm: number, to: PrecipUnit): number {
  if (to === 'in') return mm / 25.4
  return mm
}

export function convertWindSpeed(ms: number, to: WindSpeedUnit): number {
  switch (to) {
    case 'km/h':
      return ms * 3.6
    case 'mph':
      return ms * 2.237
    case 'knots':
      return ms * 1.944
    case 'm/s':
      return ms
  }
}

export function formatTemp(value: number, unit: TemperatureUnit): string {
  return `${Math.round(value)}°${unit}`
}

export function formatPressure(value: number, unit: PressureUnit): string {
  if (unit === 'inHg') return `${value.toFixed(2)} inHg`
  return `${value.toFixed(1)} hPa`
}

export function formatPrecip(value: number, unit: PrecipUnit): string {
  if (unit === 'in') return `${value.toFixed(1)} in`
  return `${value.toFixed(1)} mm`
}

export function formatWindSpeed(value: number, unit: WindSpeedUnit): string {
  return `${Math.round(value)} ${unit}`
}

export function windBearingToDirection(bearing: number): string {
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
  const index = Math.round(bearing / 22.5) % 16
  return directions[index]
}
