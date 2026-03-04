export type TradeDirection = 'Long' | 'Short';
export type TradeStatus = 'Open' | 'Closed';

export interface Trade {
  id: string;
  accountId: string;
  strategyVersionId: string | null;
  strategyId: string | null;
  strategyName: string | null;
  strategyVersionNumber: number | null;
  direction: TradeDirection;
  openedAt: string;
  closedAt: string | null;
  symbol: string;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  rMultiple: number | null;
  pnl: number | null;
  tags?: string[] | null;
  notes?: string | null;
  isArchived: boolean;
  status: TradeStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TradeFilters {
  accountId: string;
  strategyId?: string;
  status?: TradeStatus;
  dateFrom?: string;
  dateTo?: string;
  includeArchived?: boolean;
}

export interface ListTradesResponse {
  trades: Trade[];
  total: number;
}

export interface CreateTradeRequest {
  accountId: string;
  strategyId?: string;
  strategyVersionId?: string;
  direction: TradeDirection;
  openedAt: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  closedAt?: string;
  quantity?: number;
  rMultiple?: number;
  pnl?: number;
  tags?: string[];
  notes?: string;
  status?: TradeStatus;
}

export interface UpdateTradeRequest {
  strategyId?: string;
  strategyVersionId?: string;
  direction: TradeDirection;
  openedAt: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number;
  closedAt?: string;
  quantity?: number;
  rMultiple?: number;
  pnl?: number;
  tags?: string[];
  notes?: string;
  status: TradeStatus;
}
export type TradeDetail = Trade;
export type TradeResponse = Trade;
