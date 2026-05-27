import client from './client';

export type RecommendationSource = 'INVENTORY' | 'SUGGESTED_PURCHASE' | 'SPONSORED';

export interface Recommendation {
  lureId: number;
  name: string;
  brand: string;
  type: string;
  source: RecommendationSource;
  sponsored: boolean;
  purchaseUrl: string | null;
  disclosureLabel: string | null;
}

export interface RecommendationRequest {
  timeOfDay: string;
  season: string;
  region: string;
}

export async function getRecommendations(req: RecommendationRequest): Promise<Recommendation[]> {
  const res = await client.post('/recommendations', req);
  return res.data;
}

export function currentTimeOfDay(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'MORNING';
  if (hour < 17) return 'AFTERNOON';
  return 'EVENING';
}

export function currentSeason(): string {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'SPRING';
  if (month >= 6 && month <= 8) return 'SUMMER';
  if (month >= 9 && month <= 11) return 'FALL';
  return 'WINTER';
}
