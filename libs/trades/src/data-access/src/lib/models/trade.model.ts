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
