import { describe, expect, it } from 'vitest';
import { getHealthStatus } from '../../src/lib/health';

describe('getHealthStatus', () => {
  it('reports the application as healthy', () => {
    expect(getHealthStatus('frontend')).toEqual({
      status: 'ok',
      service: 'frontend'
    });
  });
});
