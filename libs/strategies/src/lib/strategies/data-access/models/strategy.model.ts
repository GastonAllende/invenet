/**
 * Strategy domain model
 */
export interface Strategy {
  id: string;
  accountId: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a new strategy
 */
export interface CreateStrategyRequest {
  name: string;
  description?: string;
}

/**
 * Response after creating a strategy
 */
export interface CreateStrategyResponse {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

/**
 * Request to update an existing strategy
 */
export interface UpdateStrategyRequest {
  name: string;
  description?: string;
}

/**
 * Response after updating a strategy
 */
export interface UpdateStrategyResponse {
  id: string;
  name: string;
  description: string | null;
  updatedAt: string;
}

/**
 * Response for a single strategy
 */
export interface GetStrategyResponse {
  id: string;
  name: string;
  description: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Response for listing strategies
 */
export interface ListStrategiesResponse {
  strategies: GetStrategyResponse[];
  total: number;
}
