import fs from 'node:fs';

const config = JSON.parse(fs.readFileSync('project.config.json', 'utf8'));

if (!config.project?.name || !config.project?.owner) {
  console.error('project.config.json precisa de project.name e project.owner.');
  process.exit(1);
}

console.log('Configuração básica do projeto válida.');
