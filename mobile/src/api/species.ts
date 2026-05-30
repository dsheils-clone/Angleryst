import client from './client';

export interface SpeciesEntry {
  id: number;
  name: string;
}

export async function getSpecies(): Promise<SpeciesEntry[]> {
  const res = await client.get('/species');
  return res.data;
}

export async function createSpecies(name: string): Promise<SpeciesEntry> {
  const res = await client.post('/species', { name });
  return res.data;
}
