import { DashboardOverview } from '@/components/dashboard-overview';
import { OperationsShell } from '@/components/operations-shell';

export default function Home() {
  return (
    <OperationsShell>
      <DashboardOverview />
    </OperationsShell>
  );
}
