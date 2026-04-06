export interface HourlyDataPoint {
  time: number
  summary: string
  icon: string
  precipIntensity: number
  precipProbability: number
  precipAccumulation?: number
  precipType?: string
  temperature: number
  apparentTemperature: number
  dewPoint: number
  humidity: number
  pressure: number
  windSpeed: number
  windGust: number
  windBearing: number
  cloudCover: number
  uvIndex: number
  visibility: number
  ozone?: number
}

export interface DailyDataPoint {
  time: number
  summary: string
  icon: string
  sunriseTime: number
  sunsetTime: number
  moonPhase: number
  precipIntensity: number
  precipIntensityMax: number
  precipIntensityMaxTime?: number
  precipProbability: number
  precipAccumulation?: number
  precipType?: string
  temperatureHigh: number
  temperatureHighTime: number
  temperatureLow: number
  temperatureLowTime: number
  apparentTemperatureHigh: number
  apparentTemperatureHighTime: number
  apparentTemperatureLow: number
  apparentTemperatureLowTime: number
  temperatureMin: number
  temperatureMinTime: number
  temperatureMax: number
  temperatureMaxTime: number
  apparentTemperatureMin: number
  apparentTemperatureMinTime: number
  apparentTemperatureMax: number
  apparentTemperatureMaxTime: number
  dewPoint: number
  humidity: number
  pressure: number
  windSpeed: number
  windGust: number
  windGustTime?: number
  windBearing: number
  cloudCover: number
  uvIndex: number
  uvIndexTime?: number
  ozone?: number
}

export interface CurrentlyData {
  time: number
  summary: string
  icon: string
  precipIntensity: number
  precipProbability: number
  precipType?: string
  temperature: number
  apparentTemperature: number
  dewPoint: number
  humidity: number
  pressure: number
  windSpeed: number
  windGust: number
  windBearing: number
  cloudCover: number
  uvIndex: number
  visibility: number
  ozone?: number
}

export interface PirateWeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  offset: number
  currently: CurrentlyData
  hourly: {
    summary: string
    icon: string
    data: HourlyDataPoint[]
  }
  daily: {
    summary: string
    icon: string
    data: DailyDataPoint[]
  }
  alerts?: Array<{
    title: string
    regions: string[]
    severity: string
    time: number
    expires: number
    description: string
    uri: string
  }>
  flags: {
    sources: string[]
    units: string
    version: string
  }
}

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
  country_code: string
}
