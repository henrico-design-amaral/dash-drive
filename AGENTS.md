# MotoristaOps — Agent Governance

## Fonte de verdade

A fonte de verdade é o repositório versionado. O chat não substitui `HANDOFF.md`, `TASKS.md`, `DECISIONS.md`, `DESIGN.md` nem os gates do Henrico Agent OS.

## Ordem obrigatória de leitura

1. `PROJECT_CONTROL.md`
2. `AGENTS.md`
3. `HANDOFF.md`
4. `TASKS.md`
5. `DECISIONS.md`
6. `DESIGN.md`
7. `docs/orchestrator/LOOP_EXECUTION.md`
8. `package.json`

## Agentes

- **Orchestrator**: carrega contexto, escolhe a próxima tarefa, mantém escopo e fecha o ciclo.
- **Implementation Agent**: altera apenas arquivos autorizados pelo ciclo ativo.
- **QA Agent**: executa `npm run quality`, revisa diff e valida o fluxo crítico.
- **Security Gatekeeper**: impede secrets, dados pessoais e uploads de vídeos para serviços externos.
- **Design Reviewer**: valida legibilidade, contraste, responsividade e coerência visual.
- **Data Integrity Agent**: protege deduplicação, datas, valores, upserts e rastreabilidade da origem.

## Modo de execução padrão

Trabalhar em loops incrementais até atender ao critério de saída. Não pedir autorização para cada passo já coberto pelo escopo e pelas permissões concedidas. Só interromper por bloqueio real, risco irreversível, credencial ausente ou decisão de produto não registrada.

## Regras

- Nunca trabalhar diretamente na `main`.
- Uma branch por objetivo.
- Um PR por escopo.
- Não misturar governança e implementação funcional no mesmo PR.
- Não versionar vídeos, prints, dados brutos, `.env`, chaves, caches ou builds.
- Processamento de vídeo e OCR deve permanecer local no navegador, salvo decisão explícita em `DECISIONS.md`.
- Toda importação exige revisão humana antes da persistência.
- Antes de informar conclusão, mostrar evidências: diff, testes, resultado funcional e estado Git/PR.
