import client from './client';

export interface Lure {
  id: number;
  name: string;
  type: string;
  brand: string | null;
  size: string | null;
  colorFamily: string | null;
  purchaseUrl: string | null;
  custom: boolean;
}

export async function getCatalog(): Promise<Lure[]> {
  const res = await client.get('/tackle/catalog');
  return res.data;
}

export async function getCustomLures(): Promise<Lure[]> {
  const res = await client.get('/tackle/custom');
  return res.data;
}

export async function createCustomLure(payload: {
  name: string;
  type: string;
  brand?: string;
  size?: string;
  colorFamily?: string;
}): Promise<Lure> {
  const res = await client.post('/tackle/custom', payload);
  return res.data;
}
