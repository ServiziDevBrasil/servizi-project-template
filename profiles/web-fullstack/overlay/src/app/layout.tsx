import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '__PROJECT_NAME__',
  description: 'Servizi Web Fullstack'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
