export type HealthStatus = {
  status: 'ok';
  timestamp: string;
};

export function getHealthStatus(now = new Date()): HealthStatus {
  return {status: 'ok', timestamp: now.toISOString()};
}
