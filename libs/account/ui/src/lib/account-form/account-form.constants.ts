export const BROKER_OPTIONS = [
  { label: 'Interactive Brokers', value: 'Interactive Brokers' },
  { label: 'TD Ameritrade', value: 'TD Ameritrade' },
  { label: 'Charles Schwab', value: 'Charles Schwab' },
  { label: 'E*TRADE', value: 'E*TRADE' },
  { label: 'Fidelity', value: 'Fidelity' },
  { label: 'OANDA', value: 'OANDA' },
  { label: 'IG Markets', value: 'IG Markets' },
  { label: 'Saxo Bank', value: 'Saxo Bank' },
  { label: 'FTMO', value: 'FTMO' },
  { label: 'Other', value: 'Other' },
] as const;

export const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Personal', value: 'Personal' },
  { label: 'Prop Firm', value: 'Prop Firm' },
  { label: 'Funded', value: 'Funded' },
] as const;

export const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'GBP', value: 'GBP' },
  { label: 'JPY', value: 'JPY' },
  { label: 'CHF', value: 'CHF' },
  { label: 'AUD', value: 'AUD' },
  { label: 'CAD', value: 'CAD' },
  { label: 'NZD', value: 'NZD' },
  { label: 'SEK', value: 'SEK' },
  { label: 'NOK', value: 'NOK' },
] as const;

export const TIMEZONE_OPTIONS = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Europe/Stockholm', value: 'Europe/Stockholm' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'America/Chicago', value: 'America/Chicago' },
  { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
  { label: 'Asia/Singapore', value: 'Asia/Singapore' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
  { label: 'Pacific/Auckland', value: 'Pacific/Auckland' },
] as const;
