import { describe, expect, it } from 'vitest';
import type { Strategy } from './models/strategy.model';

/**
 * Unit tests verifying the Strategy domain model uses userId (not accountId).
 * Regression guard for the accountId → userId rename (feature 004).
 */
describe('Strategy model — userId ownership field', () => {
  it('should accept userId on a Strategy object', () => {
    const strategy: Strategy = {
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      userId: 'bbbbbbbb-0000-0000-0000-000000000002',
      name: 'Trend Following',
      description: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(strategy.userId).toBe('bbbbbbbb-0000-0000-0000-000000000002');
  });

  it('should carry userId through a spread (simulate store entity creation)', () => {
    const raw: Strategy = {
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      userId: 'cccccccc-0000-0000-0000-000000000003',
      name: 'Mean Reversion',
      description: null,
      isDeleted: false,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    const fromStore: Strategy = { ...raw };

    expect(fromStore.userId).toBe('cccccccc-0000-0000-0000-000000000003');
    expect(fromStore.id).toBe(raw.id);
    expect(fromStore.name).toBe(raw.name);
  });
});
