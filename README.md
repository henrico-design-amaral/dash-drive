# MotoristaOps

Plataforma operacional e financeira para motoristas, construída em Astro e alimentada pela base MotoristaOps.

## Objetivo

O MotoristaOps transforma fechamentos diários em leitura operacional: receita, horas, km, ocupação, combustível, despesas, lucro e histórico de desempenho.

## Stack

- Astro Framework
- TypeScript
- CSS próprio
- Dados estáticos versionados em `src/data/motoristaops.ts`
- Pipeline Excel → JSON → validação → build → Hostinger

## Comandos

```bash
npm install
npm run dev
npm run sync:data
npm run validate:data
npm run build
npm run quality
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

1. Google Sheets MotoristaOps.
2. Site MotoristaOps publicado.

Sem essa dupla validação, o fechamento fica incompleto.

## Nome canônico

- Produto: `MotoristaOps`
- Repositório: `henrico-design-amaral/motoristaops`
- Domínio planejado: `motoristaops.henrico.works`
