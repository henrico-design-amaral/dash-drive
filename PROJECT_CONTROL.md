# MotoristaOps — Project Control

## Objetivo

Operar um dashboard financeiro e estratégico diário para motorista de aplicativo, com importação assistida de dados, fechamento diário, despesas, abastecimentos, metas e análise de desempenho.

## Fonte de verdade

- Código: repositório `henrico-design-amaral/motoristaops`
- Produção: branch `main`
- Governança: `AGENTS.md`, `HANDOFF.md`, `TASKS.md`, `DECISIONS.md`, `DESIGN.md`
- Orquestração: `docs/orchestrator/LOOP_EXECUTION.md`

## Regras centrais

- O dashboard é o centro do projeto.
- Drive é entrada/espelho operacional para mídias e documentos.
- GitHub é fonte de verdade do código.
- Nenhum vídeo da Uber deve ser enviado a terceiros pelo importador.
- Nenhum dado é persistido sem revisão humana.
- Mudanças seguem branch → validação → PR → merge.

## Escopo atual

Fortalecer o importador por gravação da Uber e integrar o resultado ao dashboard com rastreabilidade, histórico e segurança.
