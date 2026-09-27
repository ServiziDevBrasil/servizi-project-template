#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API_VERSION = '2026-03-10';
const DEFAULT_OWNER = process.env.SERVIZI_ALLOWED_OWNER || 'ServiziDevBrasil';
const RULESET_NAME = 'Proteção da main';
const SUPPORTED_PROFILES = new Set(['none', 'web-frontend', 'web-fullstack']);
const SUPPORTED_THEMES = new Set(['base', 'operations-modern']);

const currentFile = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(currentFile), '..');

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const repoFullName = getArg('--repo');
const profile = getArg('--profile') || 'none';
const theme = getArg('--theme') || 'base';
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (!repoFullName || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoFullName)) {
  console.error(
    'Uso: node scripts/bootstrap-servizi.mjs --repo OWNER/REPO --profile web-frontend|web-fullstack|none --theme base|operations-modern [--dry-run|--apply]'
  );
  process.exit(2);
}

if (!SUPPORTED_PROFILES.has(profile)) {
  console.error(`Perfil inválido: ${profile}. Use web-frontend, web-fullstack ou none.`);
  process.exit(2);
}

if (!SUPPORTED_THEMES.has(theme)) {
  console.error(`Tema inválido: ${theme}. Use base ou operations-modern.`);
  process.exit(2);
}

if (theme === 'operations-modern' && profile !== 'web-fullstack') {
  console.error('O tema operations-modern é compatível com web-fullstack nesta primeira versão.');
  process.exit(2);
}

const [owner, repo] = repoFullName.split('/');
if (owner.toLowerCase() !== DEFAULT_OWNER.toLowerCase()) {
  console.error(`Por segurança, este bootstrap só pode atuar em repositórios de ${DEFAULT_OWNER}.`);
  process.exit(2);
}

const token =
  process.env.SERVIZI_BOOTSTRAP_TOKEN ||
  process.env.GH_TOKEN ||
  process.env.GITHUB_TOKEN;

const rulesetPayload = {
  name: RULESET_NAME,
  target: 'branch',
  enforcement: 'active',
  bypass_actors: [],
  conditions: {
    ref_name: {
      include: ['~DEFAULT_BRANCH'],
      exclude: []
    }
  },
  rules: [
    { type: 'deletion' },
    { type: 'non_fast_forward' },
    {
      type: 'pull_request',
      parameters: {
        allowed_merge_methods: ['merge', 'squash', 'rebase'],
        dismiss_stale_reviews_on_push: false,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_approving_review_count: 0,
        required_review_thread_resolution: false
      }
    },
    {
      type: 'required_status_checks',
      parameters: {
        do_not_enforce_on_create: false,
        strict_required_status_checks_policy: true,
        required_status_checks: [{ context: 'quality-gate' }]
      }
    }
  ]
};

const repositorySettings = {
  allow_auto_merge: true,
  delete_branch_on_merge: true,
  allow_update_branch: true,
  allow_merge_commit: true,
  allow_squash_merge: true,
  allow_rebase_merge: true
};

const stagingEnvironment = {
  wait_timer: 0,
  prevent_self_review: false,
  reviewers: [],
  deployment_branch_policy: null
};

const productionEnvironment = {
  wait_timer: 0,
  prevent_self_review: false,
  reviewers: [],
  deployment_branch_policy: {
    protected_branches: false,
    custom_branch_policies: true
  }
};

function printPlan() {
  console.log('Servizi Bootstrap — plano');
  console.log(`Repositório: ${repoFullName}`);
  console.log(`Perfil: ${profile}`);
  console.log(`Tema: ${theme}`);
  console.log('');
  console.log('1. Habilitar auto-merge, update branch e exclusão automática de branches.');
  console.log('2. Criar/atualizar ruleset "Proteção da main".');
  console.log('   - PR obrigatório');
  console.log('   - 0 aprovações humanas');
  console.log('   - quality-gate obrigatório e branch atualizada');
  console.log('   - bloquear exclusão e force-push da main');
  console.log('3. Criar/atualizar environment staging sem restrição de branch.');
  console.log('4. Criar/atualizar environment production.');
  console.log('5. Permitir deploy em production somente pela branch main.');
  if (profile !== 'none') {
    console.log(`6. Criar PR de inicialização usando o perfil ${profile} e tema ${theme}.`);
  }
  console.log('');
  console.log(dryRun ? 'Modo: DRY-RUN — nenhuma alteração será feita.' : 'Modo: APPLY');
}

async function request(apiPath, { method = 'GET', body, allowStatuses = [] } = {}) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: token ? `Bearer ${token}` : undefined,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'servizi-project-bootstrap'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  const text = await response.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok && !allowStatuses.includes(response.status)) {
    const detail =
      typeof data === 'string'
        ? data.slice(0, 800)
        : JSON.stringify(data).slice(0, 800);
    throw new Error(`${method} ${apiPath} -> HTTP ${response.status}: ${detail}`);
  }

  return { status: response.status, data };
}

async function api(apiPath, options = {}) {
  const result = await request(apiPath, options);
  return result.data;
}

async function preflightRepositoryCapabilities(targetRepository) {
  if (!targetRepository.private) {
    console.log('✓ Preflight: repositório público suporta rulesets no plano atual.');
    return;
  }

  const rulesetCheck = await request(
    `/repos/${owner}/${repo}/rulesets?includes_parents=false&per_page=1`,
    { allowStatuses: [403] }
  );

  if (rulesetCheck.status === 403) {
    throw new Error(
      'Preflight bloqueado: este repositório é privado e o plano atual do GitHub não oferece rulesets/environments privados. ' +
      'Opções: tornar o repositório público para usar o padrão sem custo, ou usar GitHub Pro/Team para manter o repositório privado com proteção obrigatória. ' +
      'Nenhuma configuração administrativa foi aplicada nesta execução.'
    );
  }

  console.log('✓ Preflight: rulesets privados disponíveis para este repositório.');
}

async function ensureRuleset() {
  const rulesets = await api(
    `/repos/${owner}/${repo}/rulesets?includes_parents=false&per_page=100`
  );

  const current = rulesets.find(
    (item) => item.name === RULESET_NAME && item.target === 'branch'
  );

  if (current) {
    await api(`/repos/${owner}/${repo}/rulesets/${current.id}`, {
      method: 'PUT',
      body: rulesetPayload
    });
    console.log(`✓ Ruleset atualizado: ${RULESET_NAME}`);
    return;
  }

  await api(`/repos/${owner}/${repo}/rulesets`, {
    method: 'POST',
    body: rulesetPayload
  });
  console.log(`✓ Ruleset criado: ${RULESET_NAME}`);
}

async function ensureEnvironment(name, config) {
  await api(
    `/repos/${owner}/${repo}/environments/${encodeURIComponent(name)}`,
    {
      method: 'PUT',
      body: config
    }
  );
  console.log(`✓ Environment configurado: ${name}`);
}

async function ensureProductionMainPolicy() {
  const policyPath =
    `/repos/${owner}/${repo}/environments/production/deployment-branch-policies`;
  const policies = await api(`${policyPath}?per_page=100`);
  const items = policies.branch_policies || [];

  if (items.some((item) => item.name === 'main')) {
    console.log('✓ Production já permite a branch main.');
    return;
  }

  await api(policyPath, {
    method: 'POST',
    body: { name: 'main', type: 'branch' }
  });
  console.log('✓ Production restrita com regra para a branch main.');
}

function listOverlayFiles(directory, root = directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...listOverlayFiles(absolute, root));
    } else {
      files.push({
        absolute,
        relative: path.relative(root, absolute).replaceAll('\\', '/')
      });
    }
  }

  return files;
}

function replaceProjectPlaceholders(value) {
  const packageSafeName = repo.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
  return value
    .replaceAll('__PROJECT_NAME__', packageSafeName)
    .replaceAll('__PROJECT_DISPLAY_NAME__', repo);
}

async function getExistingProfile(defaultBranch) {
  const marker = await request(
    `/repos/${owner}/${repo}/contents/.servizi-profile?ref=${encodeURIComponent(defaultBranch)}`,
    { allowStatuses: [404] }
  );

  if (marker.status === 404) return null;

  const raw = Buffer.from(
    String(marker.data.content || '').replaceAll('\n', ''),
    'base64'
  ).toString('utf8');

  return JSON.parse(raw);
}

async function chooseInitializationBranch(baseName) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? baseName : `${baseName}-${attempt + 1}`;
    const result = await request(
      `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(candidate)}`,
      { allowStatuses: [404] }
    );
    if (result.status === 404) return candidate;
  }

  throw new Error('Não foi possível encontrar um nome livre para a branch de inicialização.');
}

async function enableAutoMerge(pullRequestNodeId) {
  try {
    await api('/graphql', {
      method: 'POST',
      body: {
        query:
          'mutation($pullRequestId:ID!){enablePullRequestAutoMerge(input:{pullRequestId:$pullRequestId,mergeMethod:SQUASH}){pullRequest{number}}}',
        variables: { pullRequestId: pullRequestNodeId }
      }
    });
    console.log('✓ Auto-merge solicitado para o PR de inicialização.');
  } catch (error) {
    console.warn(`Aviso: PR criado, mas auto-merge não pôde ser ativado automaticamente: ${error.message}`);
  }
}

async function initializeProfile(targetRepository) {
  if (profile === 'none') return;

  const defaultBranch = targetRepository.default_branch || 'main';
  const currentProfile = await getExistingProfile(defaultBranch);

  if (
    currentProfile?.profile === profile &&
    (currentProfile?.theme || 'base') === theme
  ) {
    console.log(`✓ Perfil ${profile} com tema ${theme} já está aplicado na ${defaultBranch}.`);
    return;
  }

  if (currentProfile?.profile && currentProfile.profile !== profile) {
    throw new Error(
      `O projeto já foi inicializado com ${currentProfile.profile}. Troca de perfil deve ser feita como migração explícita.`
    );
  }

  const overlayRoot = path.join(repositoryRoot, 'profiles', profile, 'overlay');
  if (!fs.existsSync(overlayRoot)) {
    throw new Error(`Overlay não encontrado para o perfil ${profile}.`);
  }

  const themeOverlayRoot =
    theme === 'base'
      ? null
      : path.join(repositoryRoot, 'themes', theme, 'overlay');

  if (themeOverlayRoot && !fs.existsSync(themeOverlayRoot)) {
    throw new Error(`Overlay não encontrado para o tema ${theme}.`);
  }

  const defaultRef = await api(
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(defaultBranch)}`
  );
  const baseSha = defaultRef.object.sha;
  const baseCommit = await api(
    `/repos/${owner}/${repo}/git/commits/${baseSha}`
  );

  const overlayFiles = new Map();

  for (const file of listOverlayFiles(overlayRoot)) {
    overlayFiles.set(file.relative, file);
  }

  if (themeOverlayRoot) {
    for (const file of listOverlayFiles(themeOverlayRoot)) {
      overlayFiles.set(file.relative, file);
    }
  }

  const treeEntries = [];
  for (const file of overlayFiles.values()) {
    const raw = fs.readFileSync(file.absolute, 'utf8');
    const content = replaceProjectPlaceholders(raw);
    const blob = await api(`/repos/${owner}/${repo}/git/blobs`, {
      method: 'POST',
      body: { content, encoding: 'utf-8' }
    });

    treeEntries.push({
      path: file.relative,
      mode: '100644',
      type: 'blob',
      sha: blob.sha
    });
  }

  const projectFile = await api(
    `/repos/${owner}/${repo}/contents/project.config.json?ref=${encodeURIComponent(defaultBranch)}`
  );
  const projectConfig = JSON.parse(
    Buffer.from(String(projectFile.content).replaceAll('\n', ''), 'base64').toString('utf8')
  );
  projectConfig.project.name = repo;
  projectConfig.project.template = false;
  projectConfig.project.profile = profile;
  projectConfig.project.theme = theme;

  const projectBlob = await api(`/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    body: {
      content: `${JSON.stringify(projectConfig, null, 2)}\n`,
      encoding: 'utf-8'
    }
  });

  treeEntries.push({
    path: 'project.config.json',
    mode: '100644',
    type: 'blob',
    sha: projectBlob.sha
  });

  const markerBlob = await api(`/repos/${owner}/${repo}/git/blobs`, {
    method: 'POST',
    body: {
      content: `${JSON.stringify(
        {
          profile,
          theme,
          initializedBy: 'servizi-bootstrap',
          schemaVersion: 1
        },
        null,
        2
      )}\n`,
      encoding: 'utf-8'
    }
  });

  treeEntries.push({
    path: '.servizi-profile',
    mode: '100644',
    type: 'blob',
    sha: markerBlob.sha
  });

  for (const oldPath of ['src/health.ts', 'src/index.ts']) {
    treeEntries.push({
      path: oldPath,
      mode: '100644',
      type: 'blob',
      sha: null
    });
  }

  const tree = await api(`/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    body: {
      base_tree: baseCommit.tree.sha,
      tree: treeEntries
    }
  });

  const commit = await api(`/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    body: {
      message: `chore: initialize Servizi ${profile} profile with ${theme} theme`,
      tree: tree.sha,
      parents: [baseSha]
    }
  });

  const branchName = await chooseInitializationBranch(
    `chore/initialize-${profile}-${theme}`
  );

  await api(`/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: {
      ref: `refs/heads/${branchName}`,
      sha: commit.sha
    }
  });

  const pullRequest = await api(`/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: {
      title: `chore: initialize ${profile} project with ${theme} theme`,
      head: branchName,
      base: defaultBranch,
      body:
        `Inicialização automática usando o perfil **${profile}** e tema **${theme}**.\n\n` +
        '- aplica a stack base e a camada visual escolhida;\n' +
        '- preserva governança, CI e documentação Servizi;\n' +
        '- atualiza project.config.json;\n' +
        '- aguarda o quality-gate antes do merge.'
    }
  });

  console.log(`✓ PR de inicialização criado: ${pullRequest.html_url}`);
  await enableAutoMerge(pullRequest.node_id);
}

async function main() {
  printPlan();

  if (dryRun) return;

  if (!token) {
    throw new Error(
      'Defina SERVIZI_BOOTSTRAP_TOKEN (recomendado) ou GH_TOKEN antes de usar --apply.'
    );
  }

  const targetRepository = await api(`/repos/${owner}/${repo}`);
  await preflightRepositoryCapabilities(targetRepository);

  await api(`/repos/${owner}/${repo}`, {
    method: 'PATCH',
    body: repositorySettings
  });
  console.log('✓ Configurações de Pull Request e merge atualizadas.');

  await ensureRuleset();
  await ensureEnvironment('staging', stagingEnvironment);
  await ensureEnvironment('production', productionEnvironment);
  await ensureProductionMainPolicy();
  await initializeProfile(targetRepository);

  console.log('');
  console.log('Servizi Bootstrap concluído.');
  console.log('O quality-gate continua sendo a barreira mínima antes da main.');
}

main().catch((error) => {
  console.error('');
  console.error('Bootstrap falhou:', error.message);
  process.exit(1);
});
