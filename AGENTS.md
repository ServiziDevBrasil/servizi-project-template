# Servizi — Regras para Agentes de IA

Este repositório foi desenhado para trabalho paralelo com Codex, Claude, Gemini, Copilot e outros agentes.

## Liberdade operacional
- Pode criar branches livremente.
- Pode fazer commits e push em branches de trabalho.
- Pode abrir e atualizar Pull Requests.
- Pode trabalhar em paralelo com outros agentes, sempre em branch própria.
- Não é necessária aprovação humana para o PR quando o ruleset estiver configurado com 0 approvals.

## Proteção mínima obrigatória
- Nunca fazer push direto na `main`.
- Nunca apagar ou fazer force-push na `main`.
- Alterações entram por Pull Request.
- O PR só deve ser integrado com `quality-gate` verde.
- Não contornar testes, rulesets ou controles de segurança.

## Branches
Use nomes curtos:
- `feat/<assunto>`
- `fix/<assunto>`
- `chore/<assunto>`
- `hotfix/<assunto>`

Cada agente deve usar sua própria branch/worktree quando houver trabalho paralelo.

## Antes do PR
Execute, quando aplicável:
`npm run validate`

Para mudanças de maior risco, execute também integração/E2E e valide em staging.

## Banco
- Alterações de schema somente por migration versionada.
- Nunca alterar schema diretamente em produção como fluxo normal.
- Nunca copiar dados sensíveis de produção para testes sem proteção adequada.

## Secrets
- Nunca commitar tokens, senhas, chaves ou credenciais.
- Usar environment secrets/secret managers.
- Manter somente placeholders em `.env.example`.

## Ambientes
- Branches de trabalho: livres.
- Staging: ambiente para homologação e testes de integração/E2E.
- Produção: somente código proveniente da `main`.

## Merge
Quando não houver exigência de revisão humana, o agente pode concluir o merge assim que:
1. o PR estiver atualizável e sem conflitos;
2. o `quality-gate` estiver verde;
3. não houver alteração destrutiva não documentada;
4. o rollback estiver claro para mudanças de risco médio/alto.

O objetivo é velocidade com rastreabilidade, não burocracia.
