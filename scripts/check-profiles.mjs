import fs from 'node:fs';
import path from 'node:path';

const profiles = ['web-frontend', 'web-fullstack'];
const requiredOverlayFiles = [
  'package.json',
  'tsconfig.json',
  'eslint.config.js',
  'vitest.config.ts',
  '.env.example'
];

for (const profile of profiles) {
  const base = path.join('profiles', profile);
  const manifestPath = path.join(base, 'profile.json');
  const overlay = path.join(base, 'overlay');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifesto ausente: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.id !== profile) {
    throw new Error(`profile.json inválido em ${profile}`);
  }

  for (const file of requiredOverlayFiles) {
    const target = path.join(overlay, file);
    if (!fs.existsSync(target)) {
      throw new Error(`Arquivo obrigatório ausente: ${target}`);
    }
  }
}

console.log('Perfis Servizi válidos: web-frontend, web-fullstack');


const themes = ['operations-modern'];

for (const theme of themes) {
  const base = path.join('themes', theme);
  const manifestPath = path.join(base, 'theme.json');
  const overlay = path.join(base, 'overlay');

  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifesto de tema ausente: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest.id !== theme) {
    throw new Error(`theme.json inválido em ${theme}`);
  }

  for (const file of ['package.json', 'src/app/page.tsx', 'src/app/globals.css']) {
    const target = path.join(overlay, file);
    if (!fs.existsSync(target)) {
      throw new Error(`Arquivo obrigatório do tema ausente: ${target}`);
    }
  }
}

console.log('Temas Servizi válidos: base, operations-modern');
