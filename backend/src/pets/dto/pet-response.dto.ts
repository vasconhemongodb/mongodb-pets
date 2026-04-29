import { Pet } from '../pets.service';

export interface QueryMetrics {
  query: any;
  executionTimeMillis: number | string;
  totalLatencyMillis: number;
  indexesUsed: string[] | string;
  docsScanned: number | string;
  docsReturned: number | string;
}

export interface PetResponse {
  results: Pet[];
  total: number; // Total number of documents matching the query
  metrics: QueryMetrics;
}
