export const SPECIES = [
  { id: 1, name: 'Largemouth Bass' },
  { id: 2, name: 'Smallmouth Bass' },
  { id: 3, name: 'Northern Pike' },
  { id: 4, name: 'Walleye' },
  { id: 5, name: 'Rainbow Trout' },
  { id: 6, name: 'Brown Trout' },
  { id: 7, name: 'Bluegill' },
  { id: 8, name: 'Crappie' },
];

const SPECIES_BY_ID = new Map(SPECIES.map((s) => [s.id, s.name]));

export function speciesName(id: number): string {
  return SPECIES_BY_ID.get(id) ?? `Species #${id}`;
}
