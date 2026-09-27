#!/usr/bin/env node

const API_VERSION = '2026-03-10';
const DEFAULT_OWNER = process.env.SERVIZI_ALLOWED_OWNER || 'ServiziDevBrasil';
const RULESET_NAME = 'Proteção da main';

function getArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const repoFullName = getArg('--repo');
const apply = process.argv.includes('--apply');
const dryRun = process.argv.includes('--dry-run') || !apply;

if (!repoFullName || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repoFullName)) {
  console.error('Uso: node scripts/bootstrap-servizi.mjs --repo OWNER/REPO [--dry-run|--apply]');
  process.exit(2);
}

const [owner, repo] = repoFullName.split('/');
if (owner !== DEFAULT_OWNER) {
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
  console.log('');
  console.log(dryRun ? 'Modo: DRY-RUN — nenhuma alteração será feita.' : 'Modo: APPLY');
}

async function api(path, { method = 'GET', body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
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

  if (!response.ok) {
    const detail =
      typeof data === 'string'
        ? data.slice(0, 800)
        : JSON.stringify(data).slice(0, 800);
    throw new Error(`${method} ${path} -> HTTP ${response.status}: ${detail}`);
  }

  return data;
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
  const path = `/repos/${owner}/${repo}/environments/production/deployment-branch-policies`;
  const policies = await api(`${path}?per_page=100`);
  const items = policies.branch_policies || [];

  if (items.some((item) => item.name === 'main')) {
    console.log('✓ Production já permite a branch main.');
    return;
  }

  await api(path, {
    method: 'POST',
    body: { name: 'main', type: 'branch' }
  });
  console.log('✓ Production restrita com regra para a branch main.');
}

async function main() {
  printPlan();

  if (dryRun) return;

  if (!token) {
    throw new Error(
      'Defina SERVIZI_BOOTSTRAP_TOKEN (recomendado) ou GH_TOKEN antes de usar --apply.'
    );
  }

  await api(`/repos/${owner}/${repo}`);

  await api(`/repos/${owner}/${repo}`, {
    method: 'PATCH',
    body: repositorySettings
  });
  console.log('✓ Configurações de Pull Request e merge atualizadas.');

  await ensureRuleset();
  await ensureEnvironment('staging', stagingEnvironment);
  await ensureEnvironment('production', productionEnvironment);
  await ensureProductionMainPolicy();

  console.log('');
  console.log('Servizi Bootstrap concluído.');
  console.log('Próximo gate: abra um PR real e confirme o quality-gate verde.');
}

main().catch((error) => {
  console.error('');
  console.error('Bootstrap falhou:', error.message);
  process.exit(1);
});
