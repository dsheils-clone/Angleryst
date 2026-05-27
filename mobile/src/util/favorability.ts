function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function scoreAirTemp(tempF: number): number {
  return clamp(tempF);
}

export function scoreWaterTemp(tempF: number): number {
  return clamp(tempF);
}

export function scorePressure(inHg: number): number {
  return clamp(((inHg - 28.5) / 2) * 100);
}

export function scoreWind(mph: number): number {
  return clamp((mph / 25) * 100);
}

export function scoreCloudCover(pct: number): number {
  return clamp(pct);
}

export function scorePrecip(pct: number): number {
  return clamp(pct);
}

export function scoreMoonPhase(date: Date = new Date()): { illumination: number; phase: string } {
  const synodic = 29.53058867;
  const knownNewMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const daysSince = (date.getTime() - knownNewMoon) / 86_400_000;
  const phaseDays = ((daysSince % synodic) + synodic) % synodic;
  const fraction = phaseDays / synodic;

  let phase = 'New Moon';
  if (fraction < 0.03 || fraction > 0.97) phase = 'New Moon';
  else if (fraction < 0.22) phase = 'Waxing Crescent';
  else if (fraction < 0.28) phase = 'First Quarter';
  else if (fraction < 0.47) phase = 'Waxing Gibbous';
  else if (fraction < 0.53) phase = 'Full Moon';
  else if (fraction < 0.72) phase = 'Waning Gibbous';
  else if (fraction < 0.78) phase = 'Last Quarter';
  else phase = 'Waning Crescent';

  const illumination = ((1 - Math.cos(fraction * 2 * Math.PI)) / 2) * 100;
  return { illumination: clamp(illumination), phase };
}
