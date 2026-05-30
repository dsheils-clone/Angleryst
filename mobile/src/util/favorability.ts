function clamp(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function clamp11(n: number): number {
  return Math.max(-1, Math.min(1, n));
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

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

function currentSeason(): { name: Season; activity: number; depth: number } {
  const month = new Date().getMonth() + 1; // 1–12
  // Northern hemisphere, freshwater bass context (MA)
  if (month >= 3 && month <= 5)  return { name: 'Spring', activity:  0.35, depth:  0.4  }; // pre-spawn → shallow + feeding
  if (month >= 6 && month <= 8)  return { name: 'Summer', activity:  0.45, depth: -0.2  }; // active but thermocline pulls deep midday
  if (month >= 9 && month <= 11) return { name: 'Fall',   activity:  0.55, depth:  0.1  }; // fall feed — most active season
  return                                 { name: 'Winter', activity: -0.65, depth: -0.75 }; // sluggish + deep
}

// Amplify values away from center — prevents the weighted average from clustering at midwater.
function convict(x: number): number {
  return clamp11(Math.sign(x) * Math.pow(Math.abs(x), 0.6));
}

// depth: +1 = shallow (surface), -1 = deep (bottom)
export function computeBiteGuide(params: {
  pressureTrend3h: number;
  cloudCoverPct: number;
  windMph: number;
  precipChancePct: number;
  waterTempF: number;
  airTempF: number;
  moonIllumination: number;
}): { activity: number; depth: number; season: Season } {
  const { pressureTrend3h, cloudCoverPct, windMph, precipChancePct, waterTempF, airTempF, moonIllumination } = params;

  const season = currentSeason();

  // Falling pressure → active + shallow (pre-front feeding). Rising → sluggish + deep.
  const pressureContrib = clamp11(-pressureTrend3h / 0.06);

  // Overcast → active + shallow. Clear → sluggish + deep.
  const cloudContrib = clamp11((cloudCoverPct - 50) / 50);

  // Wind activity: peak ~10 mph; 0–5 = slight positive, 15–25 = negative, 25+ = strongly negative.
  const windActivity = windMph <= 10
    ? clamp11(0.3 + (windMph / 10) * 0.7)
    : clamp11(1 - (windMph - 10) / 12);
  // High wind pushes fish deeper; calm = neutral (0).
  const windDepth = clamp11(-windMph / 20);

  // Light rain/moderate chance (+), heavy rain/storm (−).
  const precipContrib = clamp11((35 - precipChancePct) / 50);

  // Water temp: trapezoid peak 65–78°F; below 50 or above 85 → strongly negative.
  const waterContrib = waterTempF >= 65 && waterTempF <= 78
    ? 1
    : waterTempF < 65
      ? clamp11((waterTempF - 50) / 15)
      : clamp11(1 - (waterTempF - 78) / 7);

  // Air temp: bell curve at 65°F. Low weight — most useful as front proxy.
  const airContrib = clamp11(2 * (1 - Math.abs(airTempF - 65) / 30) - 1);

  // Moon: full moon → slight activity+ and shallower (dawn/dusk effect).
  const moonContrib = clamp11((moonIllumination - 50) / 50);

  // Season anchors the baseline before weather modulates it.
  const aWeights = [1.0, 0.8, 0.7, 0.7, 0.7, 0.4, 0.15, 0.7];
  const dWeights = [0.8, 0.9, 0.6, 0.5, 0.85, 0.2, 0.05, 0.8];

  const aContribs = [pressureContrib, cloudContrib, windActivity, precipContrib, waterContrib, airContrib, moonContrib, season.activity];
  const dContribs = [pressureContrib, cloudContrib, windDepth,    precipContrib, waterContrib, airContrib, moonContrib, season.depth];

  const wavg = (cs: number[], ws: number[]) =>
    cs.reduce((s, c, i) => s + c * ws[i], 0) / ws.reduce((s, w) => s + w, 0);

  return {
    activity: convict(wavg(aContribs, aWeights)),
    depth:    convict(wavg(dContribs, dWeights)),
    season:   season.name,
  };
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
