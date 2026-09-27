# Servizi Project Template

Template mestre para novos projetos de software da Servizi. Ele padroniza qualidade, segurança, rastreabilidade, testes, documentação, banco de dados e deploy sem adicionar burocracia desnecessária.

## Perfis de projeto

O Bootstrap pode inicializar dois perfis próprios da Servizi:

- **web-fullstack** — Next.js + TypeScript + Supabase, indicado para aplicações com frontend, backend, autenticação, APIs e persistência.
- **web-frontend** — React + Vite + TypeScript, indicado para dashboards, PWAs e aplicações que consomem APIs.

## Fluxo padrão

`LLM -> branch própria -> push -> PR -> quality-gate -> auto-merge -> main`

A `main` representa código apto para produção. Alterações entram por Pull Request, sem aprovação humana obrigatória por padrão.

## Quality gates

- Pull Request: typecheck + lint + unit + build.
- Staging: integração + E2E + smoke.
- Produção: smoke + monitoramento.
- Banco: migrations versionadas; nada de alteração estrutural manual diretamente em produção.

## Bootstrap automático

Depois de criar um projeto com **Use this template**, execute **Bootstrap Servizi Project** e escolha:

1. o repositório alvo;
2. o perfil `web-fullstack` ou `web-frontend`;
3. primeiro `dry-run`;
4. depois `apply`.

O bootstrap configura ruleset da `main`, `quality-gate`, auto-merge, limpeza de branches, `staging`, `production` e cria um PR para aplicar o perfil escolhido.

Veja `docs/BOOTSTRAP.md`.
