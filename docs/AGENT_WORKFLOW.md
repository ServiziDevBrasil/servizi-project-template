# Workflow para LLMs e agentes

## Objetivo
Permitir que múltiplos agentes atuem com autonomia sem transformar a `main` em ambiente de desenvolvimento.

## Fluxo
`agente -> branch própria -> commit/push -> PR -> quality-gate -> merge -> main`

Staging fica disponível para testes de integração/E2E. Produção recebe somente código da `main`.

## Trabalho paralelo
Cada agente deve:
1. criar branch própria;
2. evitar editar branch de outro agente;
3. sincronizar com a `main` quando houver conflito real;
4. registrar no PR o que alterou;
5. deixar o CI decidir a qualidade mínima.

## Gates mínimos
A única barreira obrigatória para a `main` deve ser:
- Pull Request;
- `quality-gate` aprovado;
- sem force-push;
- sem exclusão da `main`.

Aprovação humana, wait timer, code owner e revisão manual não são obrigatórios por padrão. Podem ser ativados apenas em projetos/regulações que realmente exijam isso.

## Produção
O padrão recomendado é permitir automação, mas somente a partir da `main`. Em projetos críticos, regras adicionais podem ser ativadas especificamente naquele repositório.
