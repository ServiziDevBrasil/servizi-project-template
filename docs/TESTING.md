# Estratégia de testes

## Pull Request
Typecheck, lint, testes unitários e build. Esses testes devem ser rápidos e bloquear merge quando falharem.

## Staging
Integração, E2E dos fluxos críticos, testes de banco/RLS, contract tests e smoke.

## Produção
Smoke test, health checks, logs, erros e latência.

- Baixo risco: UI/copy → lint + typecheck + testes afetados.
- Médio risco: regra de negócio → unitário + integração.
- Alto risco: auth, RLS, banco, alertas, pagamentos, roteirização, importação/exportação → unitário + integração + E2E + staging.
