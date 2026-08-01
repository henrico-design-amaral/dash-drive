import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.join(root, 'src', 'data', 'motoristaops.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };

assert(data.meta?.app === 'Dash Drive', 'meta.app inválido');
assert(data.monthly?.grossRevenue === 3823.16, `receita mensal divergente: ${data.monthly?.grossRevenue}`);
assert(data.monthly?.operationalProfit === 3234, `lucro mensal divergente: ${data.monthly?.operationalProfit}`);
assert(data.monthly?.daysWorked === 19, `dias trabalhados divergente: ${data.monthly?.daysWorked}`);
assert(data.latestDay?.date === '2026-07-30', `último fechamento divergente: ${data.latestDay?.date}`);
assert(data.latestDay?.grossRevenue === 347.31, `receita 30/07 divergente: ${data.latestDay?.grossRevenue}`);
assert(data.latestDay?.tripsTotal === 21, `viagens 30/07 divergentes: ${data.latestDay?.tripsTotal}`);
assert(data.latestDay?.kmTotal === 161, `km 30/07 divergente: ${data.latestDay?.kmTotal}`);
assert(data.latestDay?.kmPassenger === 140.4, `km com passageiro divergente: ${data.latestDay?.kmPassenger}`);
assert(Math.round((data.latestDay?.operationalProfit ?? 0) * 100) === 28478, `lucro 30/07 divergente: ${data.latestDay?.operationalProfit}`);
assert(Array.isArray(data.daily) && data.daily.length >= 10, 'histórico diário insuficiente');

if (errors.length) {
  console.error('VALIDAÇÃO FALHOU');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('OK: snapshot MotoristaOPS validado para julho/2026 e fechamento 30/07/2026.');
