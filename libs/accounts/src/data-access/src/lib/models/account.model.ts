export type AccountType = 'Cash' | 'Margin' | 'Prop' | 'Demo';

/**
 * Brokerage account model
 */
export interface Account {
  id: string;
  userId: string;
  name: string;
  broker: string;
  accountType: AccountType;
  baseCurrency: string;
  startDate: string; // ISO 8601 date string
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime string
  updatedAt: string; // ISO 8601 datetime string
  riskSettings: AccountRiskSettings;
}

/**
 * Account risk settings model
 */
export interface AccountRiskSettings {
  id: string;
  accountId: string;
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Request to create a new account
 */
export interface CreateAccountRequest {
  name: string;
  broker: string;
  accountType: AccountType;
  baseCurrency: string;
  startDate: string; // ISO 8601 date
  startingBalance: number;
  timezone?: string;
  notes?: string;
  isActive?: boolean;
  riskSettings?: CreateAccountRiskSettingsRequest;
}

/**
 * Risk settings for create request
 */
export interface CreateAccountRiskSettingsRequest {
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Request to update an existing account
 */
export interface UpdateAccountRequest {
  name: string;
  broker: string;
  accountType: AccountType;
  baseCurrency: string;
  timezone?: string;
  notes?: string;
  isActive?: boolean;
  riskSettings?: UpdateAccountRiskSettingsRequest;
}

/**
 * Risk settings for update request
 */
export interface UpdateAccountRiskSettingsRequest {
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Response for a single account
 */
export interface GetAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startDate: string;
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  riskSettings: AccountRiskSettingsResponse;
}

/**
 * Risk settings in response
 */
export interface AccountRiskSettingsResponse {
  id: string;
  accountId: string;
  riskPerTradePct: number;
  maxDailyLossPct: number;
  maxWeeklyLossPct: number;
  enforceLimits: boolean;
}

/**
 * Response for listing accounts
 */
export interface ListAccountsResponse {
  accounts: GetAccountResponse[];
  total: number;
}

/**
 * Response after creating an account
 */
export interface CreateAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  startDate: string;
  startingBalance: number;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  riskSettings: AccountRiskSettingsResponse;
}

/**
 * Response after updating an account
 */
export interface UpdateAccountResponse {
  id: string;
  name: string;
  broker: string;
  accountType: string;
  baseCurrency: string;
  timezone: string;
  notes: string | null;
  isActive: boolean;
  updatedAt: string;
  riskSettings: AccountRiskSettingsResponse;
}
