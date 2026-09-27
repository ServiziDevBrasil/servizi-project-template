'use client';

import { IconMoon, IconSun } from '@tabler/icons-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <button className="icon-button" aria-label="Alternar tema" />;
  }

  const dark = resolvedTheme === 'dark';

  return (
    <button
      className="icon-button"
      aria-label="Alternar tema"
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}
