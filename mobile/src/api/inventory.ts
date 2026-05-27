import client from './client';

export interface InventoryItem {
  id: number;
  lureId: number;
  quantity: number;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const res = await client.get('/inventory');
  return res.data;
}

export async function addToInventory(lureId: number): Promise<void> {
  await client.post(`/inventory/${lureId}`);
}

export async function updateQuantity(lureId: number, quantity: number): Promise<InventoryItem> {
  const res = await client.put(`/inventory/${lureId}`, { quantity });
  return res.data;
}

export async function removeFromInventory(lureId: number): Promise<void> {
  await client.delete(`/inventory/${lureId}`);
}
