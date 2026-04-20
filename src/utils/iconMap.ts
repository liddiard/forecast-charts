// Static ?url imports so Vite can process each SVG as a bundled asset.
// Each icon used in the app must be listed here explicitly — Vite requires
// statically-analyzable paths to emit the correct asset URLs at build time.
import clearDay from '@meteocons/svg/fill/clear-day.svg?url'
import clearNight from '@meteocons/svg/fill/clear-night.svg?url'
import cloudy from '@meteocons/svg/fill/cloudy.svg?url'
import rain from '@meteocons/svg/fill/rain.svg?url'
import snow from '@meteocons/svg/fill/snow.svg?url'
import sleet from '@meteocons/svg/fill/sleet.svg?url'
import wind from '@meteocons/svg/fill/wind.svg?url'
import fog from '@meteocons/svg/fill/fog.svg?url'
import partlyCloudyDay from '@meteocons/svg/fill/partly-cloudy-day.svg?url'
import partlyCloudyNight from '@meteocons/svg/fill/partly-cloudy-night.svg?url'
import thunderstorms from '@meteocons/svg/fill/thunderstorms.svg?url'
import overcastDay from '@meteocons/svg/fill/overcast-day.svg?url'
import overcastNight from '@meteocons/svg/fill/overcast-night.svg?url'
import partlyCloudyDayRain from '@meteocons/svg/fill/partly-cloudy-day-rain.svg?url'
import partlyCloudyNightRain from '@meteocons/svg/fill/partly-cloudy-night-rain.svg?url'
import partlyCloudyDaySnow from '@meteocons/svg/fill/partly-cloudy-day-snow.svg?url'
import partlyCloudyNightSnow from '@meteocons/svg/fill/partly-cloudy-night-snow.svg?url'
import partlyCloudyDaySleet from '@meteocons/svg/fill/partly-cloudy-day-sleet.svg?url'
import partlyCloudyNightSleet from '@meteocons/svg/fill/partly-cloudy-night-sleet.svg?url'
import thunderstormsDay from '@meteocons/svg/fill/thunderstorms-day.svg?url'
import thunderstormsNight from '@meteocons/svg/fill/thunderstorms-night.svg?url'
import drizzle from '@meteocons/svg/fill/drizzle.svg?url'
import hurricane from '@meteocons/svg/fill/hurricane.svg?url'
import mist from '@meteocons/svg/fill/mist.svg?url'
import haze from '@meteocons/svg/fill/haze.svg?url'
import hazeDay from '@meteocons/svg/fill/haze-day.svg?url'
import hazeNight from '@meteocons/svg/fill/haze-night.svg?url'
import smoke from '@meteocons/svg/fill/smoke.svg?url'
import raindrop from '@meteocons/svg/fill/raindrop.svg?url'
import sunrise from '@meteocons/svg/fill/sunrise.svg?url'
import sunset from '@meteocons/svg/fill/sunset.svg?url'
import notAvailable from '@meteocons/svg/fill/not-available.svg?url'

/** Maps meteocon icon names to their bundled asset URLs */
const svgUrlMap: Record<string, string> = {
  'clear-day': clearDay,
  'clear-night': clearNight,
  cloudy,
  rain,
  snow,
  sleet,
  wind,
  fog,
  'partly-cloudy-day': partlyCloudyDay,
  'partly-cloudy-night': partlyCloudyNight,
  thunderstorms,
  'overcast-day': overcastDay,
  'overcast-night': overcastNight,
  'partly-cloudy-day-rain': partlyCloudyDayRain,
  'partly-cloudy-night-rain': partlyCloudyNightRain,
  'partly-cloudy-day-snow': partlyCloudyDaySnow,
  'partly-cloudy-night-snow': partlyCloudyNightSnow,
  'partly-cloudy-day-sleet': partlyCloudyDaySleet,
  'partly-cloudy-night-sleet': partlyCloudyNightSleet,
  'thunderstorms-day': thunderstormsDay,
  'thunderstorms-night': thunderstormsNight,
  drizzle,
  hurricane,
  mist,
  haze,
  'haze-day': hazeDay,
  'haze-night': hazeNight,
  smoke,
  raindrop,
  sunrise,
  sunset,
  'not-available': notAvailable,
}

/** Maps a Pirate Weather icon name to its meteocon equivalent */
const iconMap: Record<string, string> = {
  'clear-day': 'clear-day',
  'clear-night': 'clear-night',
  cloudy: 'cloudy',
  rain: 'rain',
  snow: 'snow',
  sleet: 'sleet',
  wind: 'wind',
  fog: 'fog',
  'partly-cloudy-day': 'partly-cloudy-day',
  'partly-cloudy-night': 'partly-cloudy-night',
  thunderstorm: 'thunderstorms',
  // Pirate expanded icons
  'mostly-clear-day': 'clear-day',
  'mostly-clear-night': 'clear-night',
  'mostly-cloudy-day': 'overcast-day',
  'mostly-cloudy-night': 'overcast-night',
  'possible-rain-day': 'partly-cloudy-day-rain',
  'possible-rain-night': 'partly-cloudy-night-rain',
  'possible-snow-day': 'partly-cloudy-day-snow',
  'possible-snow-night': 'partly-cloudy-night-snow',
  'possible-sleet-day': 'partly-cloudy-day-sleet',
  'possible-sleet-night': 'partly-cloudy-night-sleet',
  'possible-thunderstorm-day': 'thunderstorms-day',
  'possible-thunderstorm-night': 'thunderstorms-night',
  'possible-precipitation-day': 'partly-cloudy-day-rain',
  'possible-precipitation-night': 'partly-cloudy-night-rain',
  precipitation: 'rain',
  drizzle: 'drizzle',
  'light-rain': 'drizzle',
  'heavy-rain': 'rain',
  flurries: 'snow',
  'light-snow': 'partly-cloudy-day-snow',
  'heavy-snow': 'snow',
  'very-light-sleet': 'sleet',
  'light-sleet': 'sleet',
  'heavy-sleet': 'sleet',
  breezy: 'wind',
  'dangerous-wind': 'hurricane',
  mist: 'mist',
  haze: 'haze',
  'haze-day': 'haze-day',
  'haze-night': 'haze-night',
  smoke: 'smoke',
  mixed: 'rain',
  raindrop: 'raindrop',
}

/** Gets the meteocon name for a given Pirate Weather icon name */
export const getMeteoconName = (pirateIcon: string): string =>
  iconMap[pirateIcon] ?? 'not-available'

/** Gets the bundled SVG URL for a given Pirate Weather or meteocon icon name */
export const getMeteoconSvgUrl = (icon: string): string =>
  svgUrlMap[icon] ?? svgUrlMap[getMeteoconName(icon)] ?? notAvailable
