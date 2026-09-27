'use client';

import {
  IconArrowUpRight,
  IconBuildingStore,
  IconRoute,
  IconUsers,
  IconWaveSine
} from '@tabler/icons-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

const chartData = [
  { label: 'Seg', value: 42 },
  { label: 'Ter', value: 48 },
  { label: 'Qua', value: 45 },
  { label: 'Qui', value: 59 },
  { label: 'Sex', value: 64 },
  { label: 'Sáb', value: 58 },
  { label: 'Dom', value: 71 }
];

const kpis = [
  { label: 'Operações ativas', value: '24', delta: '+12%', icon: IconWaveSine },
  { label: 'Rotas processadas', value: '1.842', delta: '+8,4%', icon: IconRoute },
  { label: 'Pontos monitorados', value: '318', delta: '+5,1%', icon: IconBuildingStore },
  { label: 'Usuários ativos', value: '96', delta: '+14%', icon: IconUsers }
];

const activity = [
  { title: 'Processamento concluído', meta: 'Roteirização nacional · há 8 min', status: 'Concluído' },
  { title: 'Nova sincronização', meta: 'Dados operacionais · há 21 min', status: 'Em andamento' },
  { title: 'Validação automática', meta: 'Quality gate · há 32 min', status: 'Concluído' },
  { title: 'Atualização de estações', meta: 'Monitoramento · há 48 min', status: 'Concluído' }
];

export function DashboardOverview() {
  return (
    <div className="dashboard-stack">
      <section className="page-heading">
        <div>
          <span className="section-kicker">Painel executivo</span>
          <h1>Visão geral</h1>
          <p>Acompanhe os principais indicadores operacionais em um único lugar.</p>
        </div>
        <button className="primary-action" type="button">
          Novo acompanhamento
          <IconArrowUpRight size={17} />
        </button>
      </section>

      <section className="kpi-grid">
        {kpis.map((item) => {
          const Icon = item.icon;
          return (
            <article className="metric-card" key={item.label}>
              <div className="metric-topline">
                <span className="metric-icon"><Icon size={19} stroke={1.8} /></span>
                <span className="metric-delta">{item.delta}</span>
              </div>
              <strong className="metric-value">{item.value}</strong>
              <span className="metric-label">{item.label}</span>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Performance</span>
              <h2>Volume operacional</h2>
            </div>
            <button className="ghost-button" type="button">Últimos 7 dias</button>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 6, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="opsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <Tooltip
                  cursor={{ stroke: 'var(--border)' }}
                  contentStyle={{
                    borderRadius: 14,
                    border: '1px solid var(--border)',
                    background: 'var(--panel)',
                    boxShadow: '0 14px 40px rgba(15, 23, 42, .10)'
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--accent)" fill="url(#opsArea)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-eyebrow">Atualizações</span>
              <h2>Atividade recente</h2>
            </div>
          </div>

          <div className="activity-list">
            {activity.map((item) => (
              <div className="activity-row" key={item.title}>
                <span className="activity-dot" />
                <div className="activity-copy">
                  <strong>{item.title}</strong>
                  <span>{item.meta}</span>
                </div>
                <span className="status-pill">{item.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
