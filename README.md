# Dash Drive

Dashboard operacional de motorista construído em Astro a partir do snapshot MotoristaOPS.

## Objetivo

O Dash Drive é o painel público do fluxo MotoristaOPS. Depois de cada fechamento do dia, a planilha MotoristaOPS deve ser atualizada e este projeto deve receber o novo snapshot de dados antes da publicação.

## Stack

- Astro Framework
- TypeScript
- CSS próprio, sem dependência de UI kit
- Dados estáticos versionados em `src/data/motoristaops.ts`

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Snapshot atual

Último fechamento validado: **30/07/2026**.

- Receita: **R$ 347,31**
- Viagens: **21**
- Horas trabalhadas: **9h05**
- Horas com passageiros: **7h23**
- Km rodados: **161 km**
- Km com passageiro: **140,4 km**
- Lucro operacional estimado: **R$ 284,78**

Consolidado julho/2026:

- Receita bruta: **R$ 3.823,16**
- Lucro operacional estimado: **R$ 3.234,00**
- Dias trabalhados: **19**
- Horas confirmadas: **75,65h**
- Km confirmados: **1.368 km**
- Corridas totais: **232**

## Regra operacional

Todo fechamento diário deve atualizar duas frentes obrigatórias:

1. Google Sheets MotoristaOPS.
2. Site Dash Drive publicado.

Sem essa dupla validação, o fechamento fica incompleto.
