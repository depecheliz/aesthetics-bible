/**
 * Provider-discovery interface. Backed by Google Places in a later phase.
 * Kept behind an interface so the data source can change without touching
 * Near Me UI/business logic.
 */

export type ProviderResult = {
  id: string;
  name: string;
  rating: number | null;
  reviewCount: number | null;
  distanceMeters: number | null;
  address: string;
};

export interface ProviderSearchService {
  searchNearby(query: string, latitude: number, longitude: number): Promise<ProviderResult[]>;
}
