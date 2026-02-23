export interface Trade {
  id: string;
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
  createdAt: string;
}

export interface ListTradesResponse {
  trades: Trade[];
  total: number;
}

/** Payload for creating a new trade */
export interface CreateTradeRequest {
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string; // ISO 8601
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
}

/** Response returned after create (HTTP 201) or update (HTTP 200) */
export interface TradeResponse {
  id: string;
  accountId: string;
  strategyId?: string | null;
  type: 'BUY' | 'SELL';
  date: string;
  symbol: string;
  entryPrice: number;
  exitPrice?: number | null;
  positionSize: number;
  investedAmount: number;
  commission: number;
  profitLoss: number;
  status: 'Win' | 'Loss' | 'Open';
  createdAt: string;
}

/** Payload for updating an existing trade (same as CreateTradeRequest minus accountId) */
export type UpdateTradeRequest = Omit<CreateTradeRequest, 'accountId'>;
