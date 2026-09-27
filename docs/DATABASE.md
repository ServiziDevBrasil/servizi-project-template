# Banco de dados

- Schema alterado somente por migration versionada.
- Validar migrations localmente e em staging antes de produção.
- Mudanças destrutivas exigem backup e plano de retorno.
- Dados reais não devem ir para teste sem anonimização adequada.
- Quando houver RLS, manter testes das policies para perfis críticos.
