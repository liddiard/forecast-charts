import type { TimeFormat } from './units'

/** Numeric parts of an instant expressed in a given IANA timezone. */
export interface ZonedParts {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** Cached Intl formatters keyed by timezone, since constructing them is expensive. */
const partsFormatters = new Map<string, Intl.DateTimeFormat>()

/** Returns (and lazily creates) a parts formatter for the given timezone. */
function getPartsFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = partsFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
    partsFormatters.set(timeZone, formatter)
  }
  return formatter
}

/** Returns the wall-clock date/time parts of `ms` in the given IANA timezone. */
export function getZonedParts(ms: number, timeZone: string): ZonedParts {
  const parts = getPartsFormatter(timeZone).formatToParts(new Date(ms))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

/**
 * Converts an absolute instant to a "wall-clock" timestamp for the given timezone,
 * represented as if it were UTC. Combined with ECharts' `useUTC` option, shifting
 * chart x-values through this makes the time axis render in the location's local time.
 *
 * Offset is resolved per-instant, so daylight-saving transitions are handled correctly.
 */
export function toZonedMs(ms: number, timeZone: string): number {
  const { year, month, day, hour, minute, second } = getZonedParts(ms, timeZone)
  return Date.UTC(year, month - 1, day, hour, minute, second)
}

/**
 * Returns the start-of-day timestamp for `ms` in the given timezone, expressed as a
 * wall-clock-as-UTC value (suitable for direct comparison with other `toZonedMs` results).
 */
export function getDayStartMs(ms: number, timeZone: string): number {
  const { year, month, day } = getZonedParts(ms, timeZone)
  return Date.UTC(year, month - 1, day)
}

/** Cached day-label formatters keyed by timezone. */
const dayFormatters = new Map<string, Intl.DateTimeFormat>()

/** Cached time formatters keyed by `${timeZone}|${timeFormat}`. */
const timeFormatters = new Map<string, Intl.DateTimeFormat>()

/** Formats a date as e.g. "Mon 4/15" in the given timezone. */
export function formatZonedDay(ms: number, timeZone: string): string {
  let formatter = dayFormatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'numeric',
      day: 'numeric',
    })
    dayFormatters.set(timeZone, formatter)
  }
  const parts = formatter.formatToParts(new Date(ms))
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  return `${get('weekday')} ${get('month')}/${get('day')}`
}

/** Formats a time as e.g. "5:30 AM" (12h) or "17:30" (24h) in the given timezone. */
export function formatZonedTime(ms: number, timeZone: string, timeFormat: TimeFormat): string {
  const key = `${timeZone}|${timeFormat}`
  let formatter = timeFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat !== '24h',
    })
    timeFormatters.set(key, formatter)
  }
  return formatter.format(new Date(ms))
}
