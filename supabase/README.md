# Supabase

Use esta pasta quando o projeto utilizar Supabase/PostgreSQL.

- `migrations/`: mudanças versionadas de schema.
- `tests/`: testes SQL/RLS, preferencialmente pgTAP.

Desenvolva migrations localmente e aplique primeiro em staging. Não mantenha dumps com dados reais no Git. Evite alterações estruturais manuais diretamente em produção.
