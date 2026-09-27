# Deploy

## Ambientes
LOCAL → TEST → STAGING → PRODUCTION

Produção não é ambiente de desenvolvimento.

## Processo
1. Branch curta.
2. Pull Request.
3. Quality gate do CI.
4. Validação em staging quando aplicável.
5. Aprovação.
6. Merge/publicação.
7. Smoke test.
8. Monitoramento.

Todo sistema deve ter procedimento documentado para retornar à última versão estável. Registre versão, commit e data do deploy.
