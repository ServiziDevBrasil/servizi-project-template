# Servizi Project Template

Template mestre para novos projetos de software da Servizi. Ele padroniza qualidade, segurança, rastreabilidade, testes, documentação, banco de dados e deploy sem adicionar burocracia desnecessária.

## Fluxo padrão
`branch curta -> Pull Request -> CI -> staging -> homologação -> main -> produção -> smoke + monitoramento`

A `main` representa código apto para produção. Alterações entram por Pull Request.

## Ao criar um novo projeto
1. Crie o repositório a partir deste template.
2. Preencha `project.config.json` e `tooling.yml`.
3. Adapte a stack e os scripts do `package.json`.
4. Gere e versione o `package-lock.json`.
5. Configure GitHub Environments: `staging` e `production`.
6. Cadastre secrets somente nos secret managers.
7. Proteja a `main` exigindo o quality gate do CI.
8. Preencha a documentação mínima em `docs/`.

## Quality gates
- Pull Request: typecheck + lint + unit + build.
- Staging: integração + E2E + smoke.
- Produção: smoke + monitoramento.
- Banco: migrations versionadas; nada de alteração estrutural manual diretamente em produção.
