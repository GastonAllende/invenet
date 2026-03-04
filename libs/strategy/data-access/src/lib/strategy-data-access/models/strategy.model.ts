export interface CurrentVersionSummary {
  id: string;
  versionNumber: number;
  createdAt: string;
  timeframe: string | null;
}

export interface StrategyVersionDetail {
  id: string;
  versionNumber: number;
  timeframe: string | null;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  notes: string | null;
  createdAt: string;
  createdByUserId: string;
}

export interface StrategyVersionHistoryItem {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdByUserId: string;
}

export interface StrategyListItem {
  id: string;
  name: string;
  market: string | null;
  defaultTimeframe: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  currentVersion: CurrentVersionSummary | null;
}

export interface ListStrategiesResponse {
  strategies: StrategyListItem[];
  total: number;
}

export interface GetStrategyResponse {
  id: string;
  name: string;
  market: string | null;
  defaultTimeframe: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  currentVersion: StrategyVersionDetail | null;
  versions: StrategyVersionHistoryItem[];
}

export interface CreateStrategyRequest {
  name: string;
  market?: string;
  defaultTimeframe?: string;
  timeframe?: string;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  notes?: string;
}

export interface CreateStrategyResponse {
  id: string;
  name: string;
  market: string | null;
  defaultTimeframe: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  versionId: string;
  versionNumber: number;
}

export interface CreateStrategyVersionRequest {
  timeframe?: string;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  notes?: string;
}

export interface CreateStrategyVersionResponse {
  id: string;
  versionNumber: number;
  createdAt: string;
  createdByUserId: string;
  timeframe: string | null;
  entryRules: string;
  exitRules: string;
  riskRules: string;
  notes: string | null;
}
