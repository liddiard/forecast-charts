import { getMeteoconName } from '../../utils/iconMap'

interface WeatherIconProps {
  icon: string
  size?: number
  className?: string
}

export function WeatherIcon({ icon, size = 64, className }: WeatherIconProps) {
  const meteoconName = getMeteoconName(icon)
  const src = new URL(
    `../../../node_modules/@bybas/weather-icons/production/fill/all/${meteoconName}.svg`,
    import.meta.url,
  ).href

  return <img src={src} alt={icon} width={size} height={size} className={className} />
}
