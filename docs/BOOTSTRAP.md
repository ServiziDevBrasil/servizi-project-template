# Bootstrap Servizi

O Bootstrap Servizi aplica automaticamente o padrão de engenharia do template a um novo repositório.

## O que ele configura

- auto-merge;
- atualização de branches de Pull Request;
- exclusão automática da branch após merge;
- merge, squash e rebase permitidos;
- ruleset `Proteção da main`;
- Pull Request obrigatório para a `main`;
- zero aprovações humanas obrigatórias;
- `quality-gate` obrigatório;
- branch atualizada antes do merge;
- bloqueio de exclusão e force-push da `main`;
- environment `staging` livre para homologação;
- environment `production`;
- somente a branch `main` pode fazer deploy em `production`.

O fluxo permanece agent-friendly:

`LLM -> branch -> push -> PR -> quality-gate -> auto-merge -> main`

## Segurança

O script só aceita repositórios cujo owner seja `ServiziDevBrasil`, salvo se `SERVIZI_ALLOWED_OWNER` for explicitamente alterado.

O token nunca deve ser commitado. Use secret do GitHub Actions ou variável de ambiente local.

## Teste sem alterar nada

```bash
node scripts/bootstrap-servizi.mjs --repo ServiziDevBrasil/meu-projeto --dry-run
```

## Aplicação local

Defina um token administrativo em `SERVIZI_BOOTSTRAP_TOKEN` e execute:

```bash
node scripts/bootstrap-servizi.mjs --repo ServiziDevBrasil/meu-projeto --apply
```

## Automação central

O workflow **Bootstrap Servizi Project** deste repositório permite aplicar o padrão pelo GitHub Actions.

Ele exige um secret chamado:

`SERVIZI_BOOTSTRAP_TOKEN`

Recomendação para token fine-grained:

- Resource owner: `ServiziDevBrasil`
- Repository access: os repositórios que serão gerenciados; para automação de projetos futuros, usar todos os repositórios da conta.
- Repository permissions:
  - **Administration: Read and write**
  - **Actions: Read**

Use expiração limitada e faça rotação periódica. Para uma estrutura maior, substitua o PAT por um GitHub App dedicado.

## Uso futuro

1. Criar projeto em **Use this template**.
2. Abrir o repositório `servizi-project-template`.
3. Ir em **Actions -> Bootstrap Servizi Project -> Run workflow**.
4. Informar `ServiziDevBrasil/nome-do-projeto`.
5. Primeiro rodar em `dry-run`.
6. Depois rodar em `apply`.
7. Confirmar o primeiro PR com `quality-gate` verde.

O bootstrap é idempotente: pode ser executado novamente para restaurar o padrão gerenciado.
