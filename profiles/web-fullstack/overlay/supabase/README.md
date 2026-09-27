# Supabase

Este projeto usa Supabase/PostgreSQL como backend de dados quando configurado.

- `migrations/`: mudanças de schema versionadas.
- `tests/`: testes SQL/RLS.
- credenciais reais ficam em secret managers.
- alterações estruturais devem passar por migration e staging antes de produção.
