'use client';

import {
  IconBell,
  IconChartBar,
  IconCloud,
  IconLayoutDashboard,
  IconMap2,
  IconSearch,
  IconSettings,
  IconUsers
} from '@tabler/icons-react';
import { ThemeToggle } from './theme-toggle';

const nav = [
  { label: 'Visão geral', icon: IconLayoutDashboard, active: true },
  { label: 'Operações', icon: IconChartBar },
  { label: 'Mapa', icon: IconMap2 },
  { label: 'Monitoramento', icon: IconCloud },
  { label: 'Equipe', icon: IconUsers }
];

export function OperationsShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ops-shell">
      <aside className="ops-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">S</div>
          <div>
            <strong>Servizi</strong>
            <span>Operations</span>
          </div>
        </div>

        <nav className="ops-nav">
          <span className="nav-caption">Workspace</span>
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={item.active ? 'nav-item active' : 'nav-item'}
                type="button"
              >
                <Icon size={19} stroke={1.8} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" type="button">
            <IconSettings size={19} stroke={1.8} />
            <span>Configurações</span>
          </button>
          <div className="profile-row">
            <div className="avatar">DL</div>
            <div className="profile-copy">
              <strong>Equipe Servizi</strong>
              <span>Ambiente operacional</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="ops-main">
        <header className="ops-header">
          <div>
            <span className="breadcrumb">Operações / Visão geral</span>
          </div>
          <div className="header-actions">
            <label className="search-box">
              <IconSearch size={17} />
              <input placeholder="Buscar..." aria-label="Buscar" />
            </label>
            <button className="icon-button" aria-label="Notificações">
              <IconBell size={18} />
            </button>
            <ThemeToggle />
          </div>
        </header>

        <main className="ops-content">{children}</main>
      </div>
    </div>
  );
}
