import { Lure } from '../api/tackle';

type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';

export interface LureRec {
  lure: Lure;
  score: number;
  tagline: string;
}

export interface RecommendResult {
  fromBag: LureRec[];
  fromCatalog: LureRec[];
}

const TYPE_PROFILES: Record<string, { activity: number; depth: number }> = {
  'Topwater Popper':     { activity: 1.0,  depth: 1.0 },
  'Topwater Walker':     { activity: 0.9,  depth: 1.0 },
  'Topwater Plopper':    { activity: 0.9,  depth: 0.9 },
  'Topwater Frog':       { activity: 0.7,  depth: 1.0 },
  'Buzzbait':            { activity: 0.9,  depth: 0.9 },
  'Buzzbait Frog':       { activity: 0.8,  depth: 0.9 },
  'Spinnerbait':         { activity: 0.7,  depth: 0.3 },
  'Bladed Jig':          { activity: 0.7,  depth: 0.0 },
  'Swim Jig':            { activity: 0.5,  depth: 0.3 },
  'Deep Crank':          { activity: 0.6,  depth: -0.7 },
  'Lipless Crank':       { activity: 0.6,  depth: -0.3 },
  'Squarebill Crank':    { activity: 0.4,  depth: 0.4 },
  'Medium Crank':        { activity: 0.3,  depth: -0.1 },
  'Crankbait':           { activity: 0.3,  depth: 0.0 },
  'Jerkbait':            { activity: 0.2,  depth: 0.2 },
  'Swimbait':            { activity: 0.5,  depth: -0.3 },
  'Stick Bait':          { activity: -0.3, depth: 0.4 },
  'Fluke':               { activity: -0.2, depth: 0.5 },
  'Soft Plastic Worm':   { activity: -0.5, depth: -0.2 },
  'Finesse Jig':         { activity: -0.5, depth: -0.3 },
  'Jig':                 { activity: -0.3, depth: -0.7 },
  'Football Jig':        { activity: -0.6, depth: -0.9 },
  'Jighead':             { activity: -0.2, depth: -0.2 },
  'Soft Plastic Craw':   { activity: -0.4, depth: -0.7 },
  'Soft Plastic Grub':   { activity: -0.3, depth: -0.3 },
  'Soft Plastic Tube':   { activity: -0.5, depth: -0.6 },
  'Soft Plastic Shad':   { activity: 0.0,  depth: 0.0 },
  'Soft Plastic Creature':{ activity: -0.2, depth: 0.2 },
  'Lizard':              { activity: -0.1, depth: 0.1 },
  'Inline Spinner':      { activity: 0.5,  depth: 0.3 },
  'Crappie Jig':         { activity: -0.2, depth: -0.3 },
  'Panfish Grub':        { activity: -0.1, depth: 0.0 },
  'Panfish Spinner':     { activity: 0.4,  depth: 0.3 },
  'Panfish Jig Spinner': { activity: 0.2,  depth: 0.0 },
  'Panfish Soft Plastic':{ activity: -0.3, depth: 0.1 },
};

const SEASON_BONUS: Record<Season, string[]> = {
  Spring: ['Jig', 'Football Jig', 'Soft Plastic Craw'],
  Summer: ['Topwater Popper', 'Topwater Walker', 'Topwater Plopper', 'Buzzbait', 'Buzzbait Frog'],
  Fall:   ['Lipless Crank', 'Spinnerbait', 'Swimbait'],
  Winter: ['Jig', 'Football Jig', 'Soft Plastic Tube', 'Finesse Jig'],
};

function tagline(activity: number, depth: number): string {
  if (activity > 0.15 && depth > 0.15) return 'Active fish near the surface';
  if (activity > 0.15 && depth < -0.15) return 'Active fish holding deep';
  if (activity < -0.15 && depth > 0.15) return 'Sluggish fish up shallow';
  if (activity < -0.15 && depth < -0.15) return 'Sluggish fish on bottom';
  return 'Mixed conditions';
}

function scoreLure(lure: Lure, activity: number, depth: number, season: Season): number {
  const profile = TYPE_PROFILES[lure.type] ?? { activity: 0, depth: 0 };
  const dist = Math.sqrt((profile.activity - activity) ** 2 + (profile.depth - depth) ** 2);
  const base = 1 / (1 + dist);
  const bonus = SEASON_BONUS[season].includes(lure.type) ? 0.1 : 0;
  return base + bonus;
}

export function recommendLures(params: {
  activity: number;
  depth: number;
  season: Season;
  inventoryLures: Lure[];
  catalogLures: Lure[];
}): RecommendResult {
  const { activity, depth, season, inventoryLures, catalogLures } = params;
  const tag = tagline(activity, depth);
  const bagIds = new Set(inventoryLures.map((l) => l.id));

  const dedupe = (recs: LureRec[]) => {
    const seen = new Set<string>();
    return recs.filter(({ lure }) => seen.has(lure.type) ? false : (seen.add(lure.type), true));
  };

  const BAG_THRESHOLD = 0.5;
  const dedupedBag = dedupe(
    inventoryLures
      .map((lure) => ({ lure, score: scoreLure(lure, activity, depth, season), tagline: tag }))
      .sort((a, b) => b.score - a.score)
  );
  const fromBag = dedupedBag.length === 0 ? [] : [
    dedupedBag[0],
    ...dedupedBag.slice(1).filter((r) => r.score >= BAG_THRESHOLD),
  ].slice(0, 3);

  const fromCatalog = dedupe(
    catalogLures
      .filter((l) => !bagIds.has(l.id))
      .map((lure) => ({ lure, score: scoreLure(lure, activity, depth, season), tagline: tag }))
      .sort((a, b) => b.score - a.score)
  ).slice(0, 3);

  return { fromBag, fromCatalog };
}
