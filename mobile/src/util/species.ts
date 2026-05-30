export const SPECIES = [
  { id: 1, name: 'Largemouth Bass' },
  { id: 2, name: 'Smallmouth Bass' },
  { id: 3, name: 'Northern Pike' },
  { id: 4, name: 'Walleye' },
  { id: 5, name: 'Rainbow Trout' },
  { id: 6, name: 'Brown Trout' },
  { id: 7, name: 'Bluegill' },
  { id: 8, name: 'Crappie' },
  { id: 9, name: 'Brook Trout' },
  { id: 10, name: 'Chain Pickerel' },
];

const SPECIES_BY_ID = new Map(SPECIES.map((s) => [s.id, s.name]));

export function registerSpecies(id: number, name: string) {
  SPECIES_BY_ID.set(id, name);
}

export function speciesName(id: number): string {
  return SPECIES_BY_ID.get(id) ?? `Species #${id}`;
}

export function toTitleCase(s: string): string {
  return s.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}
