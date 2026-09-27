import { describe, expect, it } from 'vitest';
import { getHealthStatus } from '../../src/health.js';

describe('getHealthStatus', () => {
  it('returns a deterministic healthy status', () => {
    const date = new Date('2026-09-27T12:00:00.000Z');
    expect(getHealthStatus(date)).toEqual({
      status: 'ok',
      timestamp: '2026-09-27T12:00:00.000Z'
    });
  });
});
