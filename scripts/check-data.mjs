import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/data/motoristaops.ts', import.meta.url), 'utf8');

const required = [
  "label: '30/07/2026'",
  'gross: 347.31',
  'profit: 284.78',
  'km: 161',
  'passengerKm: 140.4',
  'trips: 21',
  'gross: 3823.16',
  'operationalProfit: 3234.00'
];

const missing = required.filter((needle) => !source.includes(needle));

if (missing.length > 0) {
  console.error('Falha na validação do snapshot MotoristaOPS. Ausentes:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('OK: snapshot MotoristaOPS validado para 30/07/2026 e consolidado julho/2026.');
