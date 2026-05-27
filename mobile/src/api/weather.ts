import axios from 'axios';

export interface CurrentConditions {
  airTempF: number;
  waterTempF: number;
  pressureInHg: number;
  pressureTrend6h: number;
  windMph: number;
  cloudCoverPct: number;
  precipChancePct: number;
}

const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const GEOCODE = 'https://geocoding-api.open-meteo.com/v1/search';

const townCoordsCache = new Map<string, { latitude: number; longitude: number }>();

export async function geocodeTown(town: string, region = 'Massachusetts'): Promise<{ latitude: number; longitude: number }> {
  const key = `${town}, ${region}`;
  const cached = townCoordsCache.get(key);
  if (cached) return cached;
  const res = await axios.get(GEOCODE, { params: { name: town, count: 5 } });
  const results: any[] = res.data.results ?? [];
  const match = results.find((r) => r.admin1 === region) ?? results[0];
  if (!match) throw new Error(`Could not geocode town: ${town}`);
  const coords = { latitude: match.latitude, longitude: match.longitude };
  townCoordsCache.set(key, coords);
  return coords;
}

export async function getConditions(latitude: number, longitude: number): Promise<CurrentConditions> {
  const res = await axios.get(OPEN_METEO, {
    params: {
      latitude,
      longitude,
      current: 'temperature_2m,surface_pressure,wind_speed_10m,cloud_cover,precipitation_probability',
      hourly: 'temperature_2m,surface_pressure',
      temperature_unit: 'fahrenheit',
      wind_speed_unit: 'mph',
      timezone: 'auto',
      past_days: 3,
      forecast_days: 1,
    },
  });

  const current = res.data.current;
  const hourly = res.data.hourly;

  const pressureHpaNow = current.surface_pressure;
  const pressureInHgNow = pressureHpaNow * 0.02953;

  const hourlyPressureHpa: number[] = hourly.surface_pressure ?? [];
  const idxNow = hourlyPressureHpa.length - 24;
  const idx6hAgo = Math.max(0, idxNow - 6);
  const pressure6hAgoHpa = hourlyPressureHpa[idx6hAgo] ?? pressureHpaNow;
  const pressureTrend6h = (pressureHpaNow - pressure6hAgoHpa) * 0.02953;

  const recentTemps: number[] = (hourly.temperature_2m ?? []).slice(0, 72);
  const avg3dayAirF = recentTemps.length
    ? recentTemps.reduce((a, b) => a + b, 0) / recentTemps.length
    : current.temperature_2m;
  const waterTempF = avg3dayAirF - 3;

  return {
    airTempF: current.temperature_2m,
    waterTempF,
    pressureInHg: pressureInHgNow,
    pressureTrend6h,
    windMph: current.wind_speed_10m,
    cloudCoverPct: current.cloud_cover,
    precipChancePct: current.precipitation_probability ?? 0,
  };
}
