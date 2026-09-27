# Bootstrap Servizi

O Bootstrap Servizi aplica automaticamente o padrão de engenharia e, opcionalmente, uma stack inicial ao novo repositório.

## Perfis

### web-fullstack
Next.js + React + TypeScript + Supabase. Base para portais, sistemas internos, SaaS, autenticação, APIs e persistência.

### web-frontend
React + Vite + TypeScript. Base para dashboards, PWAs, mapas e aplicações orientadas a APIs externas.

### none
Aplica apenas governança do GitHub, sem trocar a stack de aplicação.

## O que o bootstrap configura

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
- environment `staging` livre;
- environment `production`;
- somente `main` pode publicar em `production`;
- PR automático de inicialização do perfil escolhido.

## Segurança

O token fica somente em GitHub Actions Secrets.

Para aplicar apenas governança:
- **Administration: Read and write**

Para também criar o PR de inicialização do perfil:
- **Administration: Read and write**
- **Contents: Read and write**
- **Pull requests: Read and write**

Metadata read-only é concedido automaticamente pelo GitHub.

O script só aceita repositórios cujo owner seja `ServiziDevBrasil`, salvo alteração explícita de `SERVIZI_ALLOWED_OWNER`.

## Uso

1. Crie o novo repositório usando **Use this template**.
2. No template mestre, abra **Actions -> Bootstrap Servizi Project**.
3. Informe o repositório alvo.
4. Escolha `web-fullstack`, `web-frontend` ou `none`.
5. Rode `dry-run`.
6. Rode `apply`.
7. O bootstrap cria o PR de inicialização e solicita auto-merge.
8. O `quality-gate` decide a entrada na `main`.

O bootstrap não troca silenciosamente um perfil já aplicado. Mudança de stack é tratada como migração explícita.
