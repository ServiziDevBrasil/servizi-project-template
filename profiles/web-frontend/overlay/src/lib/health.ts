export type HealthStatus = {
  status: 'ok';
  service: string;
};

export function getHealthStatus(service = '__PROJECT_NAME__'): HealthStatus {
  return { status: 'ok', service };
}
