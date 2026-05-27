import client from './client';

export interface Catch {
  id: number;
  speciesId: number;
  weight: number;
  length: number;
  locationId: number;
  lureId: number;
  dateCaught: string;
  createdAt: string;
}

export interface LogCatchRequest {
  speciesId: number;
  weight: number;
  length: number;
  locationId: number;
  lureId: number;
  dateCaught: string;
}

export async function getCatches(): Promise<Catch[]> {
  const res = await client.get('/catches');
  return res.data;
}

export async function logCatch(payload: LogCatchRequest): Promise<Catch> {
  const res = await client.post('/catches', payload);
  return res.data;
}
