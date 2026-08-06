# MotoristaOps — Handoff

## Estado atual

A `main` contém o MVP do importador de gravação da Uber, com upload de vídeo, OCR local, deduplicação visual básica, revisão humana e persistência em `daily_closings`.

## Branch ativa

`chore/add-agent-loop-governance`

## Objetivo da branch

Instalar a camada mínima de governança do MotoristaOps sem alterar comportamento funcional.

## Próximo ciclo técnico

1. Criar histórico de importações.
2. Melhorar o parser de OCR para telas da Uber.
3. Exibir confiança, erros e duplicatas de forma mais clara.
4. Integrar anexos de imagens ao fechamento diário.
5. Conectar a sincronização com a planilha MotoristaOps.

## Riscos conhecidos

- OCR pode falhar com baixa resolução, rolagem rápida ou mudanças na interface da Uber.
- A importação atual depende de revisão manual antes de salvar.
- Ainda não há testes automatizados específicos para o importador.
- Ainda não há registro persistido de lotes de importação.

## Critério de retomada

Ler `PROJECT_CONTROL.md`, `AGENTS.md`, `TASKS.md`, `DECISIONS.md`, `DESIGN.md` e `docs/orchestrator/LOOP_EXECUTION.md` antes de editar.
