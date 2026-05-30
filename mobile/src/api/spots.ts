import client from './client';

export interface Spot {
  id: number;
  name: string;
  town: string | null;
  latitude: number;
  longitude: number;
  isPublic: boolean;
  userId: number | null;
}

export interface CreateSpotRequest {
  name: string;
  town: string;
  latitude: number;
  longitude: number;
}

export async function getSpots(limit?: number): Promise<Spot[]> {
  const res = await client.get('/locations', { params: limit ? { limit } : {} });
  return res.data;
}

export async function createSpot(payload: CreateSpotRequest): Promise<Spot> {
  const res = await client.post('/locations', payload);
  return res.data;
}
