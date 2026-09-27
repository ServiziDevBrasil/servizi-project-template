# Bootstrap Checklist

Ao criar um projeto novo:

- [ ] Renomear/preencher `project.config.json`.
- [ ] Preencher `tooling.yml`.
- [ ] Escolher stack/framework e ajustar `package.json`.
- [ ] Gerar e commitar `package-lock.json`.
- [ ] Configurar `staging` e `production` em GitHub Environments.
- [ ] Definir `STAGING_BASE_URL` e `PRODUCTION_BASE_URL`.
- [ ] Cadastrar secrets somente nos secret managers.
- [ ] Proteger `main` e exigir `CI / quality-gate`.
- [ ] Bloquear force-push e exclusão da `main`.
- [ ] Definir aprovação quando houver equipe.
- [ ] Validar rollback.
- [ ] Preencher documentação mínima.
- [ ] Rodar `npm run validate`.
