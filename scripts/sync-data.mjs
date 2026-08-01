import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

const root = path.resolve(import.meta.dirname, '..');
const sourceDir = path.join(root, 'public', 'source');
const candidates = fs.existsSync(sourceDir)
  ? fs.readdirSync(sourceDir).filter((file) => file.toLowerCase().endsWith('.xlsx')).sort()
  : [];

if (!candidates.length) {
  console.error('Nenhum arquivo XLSX encontrado em public/source/.');
  process.exit(1);
}

const workbookFile = candidates.at(-1);
const workbookPath = path.join(sourceDir, workbookFile);
const workbook = XLSX.readFile(workbookPath, { cellDates: true });

const readSheet = (name) => {
  const sheet = workbook.Sheets[name];
  if (!sheet) throw new Error(`Aba obrigatória não encontrada: ${name}`);
  return XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
};

const num = (value, fallback = 0) => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = String(value).replace(/R\$/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const round2 = (value) => Math.round((num(value) + Number.EPSILON) * 100) / 100;
const isoDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10);
  if (typeof value === 'number') return XLSX.SSF.parse_date_code(value) ? new Date(Date.UTC(
    XLSX.SSF.parse_date_code(value).y,
    XLSX.SSF.parse_date_code(value).m - 1,
    XLSX.SSF.parse_date_code(value).d
  )).toISOString().slice(0, 10) : null;
  const match = String(value ?? '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
};
const dateBR = (iso) => iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : null;
const hoursLabel = (hours) => {
  if (hours === null || hours === undefined) return '—';
  const minutes = Math.round(num(hours) * 60);
  return `${Math.floor(minutes / 60)}h${String(minutes % 60).padStart(2, '0')}`;
};
const platformMix = (row) => [
  num(row['Ganhos Uber']) ? 'Uber' : null,
  num(row['Ganhos 99']) ? '99' : null,
  num(row['Ganhos particular']) ? 'Particular' : null
].filter(Boolean).join(' + ') || row['Plataforma principal'] || '—';

const daily = readSheet('Operação Diária').map((row) => {
  const date = isoDate(row.Data);
  const grossRevenue = round2(row['Receita bruta']);
  if (!date || grossRevenue <= 0) return null;
  const hoursOnline = row['Horas online'] === null ? null : num(row['Horas online'], null);
  const hoursInRide = row['Horas em corrida'] === null ? null : num(row['Horas em corrida'], null);
  const kmTotal = row['KM total'] === null ? null : round2(row['KM total']);
  const kmPassenger = row['KM com passageiro'] === null ? null : round2(row['KM com passageiro']);
  return {
    date,
    dateBR: dateBR(date),
    day: row.Dia || '—',
    shift: row.Turno || '—',
    platform: row['Plataforma principal'] || platformMix(row),
    platformMix: platformMix(row),
    hoursOnline,
    hoursOnlineLabel: hoursLabel(hoursOnline),
    hoursInRide,
    hoursInRideLabel: hoursLabel(hoursInRide),
    kmTotal,
    kmPassenger,
    tripsUber: Math.trunc(num(row['Corridas Uber'])),
    trips99: Math.trunc(num(row['Corridas 99'])),
    tripsPrivate: Math.trunc(num(row['Corridas particular'])),
    tripsTotal: Math.trunc(num(row['Corridas totais'])),
    revenueUber: round2(row['Ganhos Uber']),
    revenue99: round2(row['Ganhos 99']),
    revenuePrivate: round2(row['Ganhos particular']),
    extras: round2(row['Gorjetas / extras']),
    grossRevenue,
    fuelCost: round2(row['Combustível estimado']),
    foodCost: round2(row.Alimentação),
    washCost: round2(row.Lavagem),
    operationalExpense: round2(row['Despesa operacional']),
    operationalProfit: round2(row['Lucro operacional']),
    margin: num(row['Margem operacional'], null),
    revenuePerHour: num(row['Receita / hora'], null),
    profitPerHour: num(row['Lucro / hora'], null),
    revenuePerKm: num(row['Receita / km'], null),
    profitPerKm: num(row['Lucro / km'], null),
    kmOccupancy: num(row['Ocupação por km'], null),
    tripsPerHour: num(row['Corridas / hora'], null),
    ticketAverage: num(row['Ticket médio'], null),
    notes: row.Observações || ''
  };
}).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));

if (!daily.length) throw new Error('Nenhum fechamento válido encontrado em Operação Diária.');

const latestDay = daily.at(-1);
const month = latestDay.date.slice(0, 7);
const monthRows = daily.filter((row) => row.date.startsWith(month));
const sum = (key) => monthRows.reduce((total, row) => total + num(row[key]), 0);
const monthly = {
  month,
  monthLabel: new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`)),
  grossRevenue: round2(sum('grossRevenue')),
  operationalProfit: round2(sum('operationalProfit')),
  operationalExpense: round2(sum('operationalExpense')),
  margin: sum('grossRevenue') ? sum('operationalProfit') / sum('grossRevenue') : 0,
  daysWorked: monthRows.length,
  hours: round2(sum('hoursOnline')),
  hoursLabel: hoursLabel(sum('hoursOnline')),
  kmTotal: round2(sum('kmTotal')),
  kmPassenger: round2(sum('kmPassenger')),
  trips: Math.trunc(sum('tripsTotal')),
  revenuePerHour: sum('hoursOnline') ? sum('grossRevenue') / sum('hoursOnline') : 0,
  profitPerHour: sum('hoursOnline') ? sum('operationalProfit') / sum('hoursOnline') : 0,
  revenuePerKm: sum('kmTotal') ? sum('grossRevenue') / sum('kmTotal') : 0,
  profitPerKm: sum('kmTotal') ? sum('operationalProfit') / sum('kmTotal') : 0,
  occupancyByKm: sum('kmTotal') ? sum('kmPassenger') / sum('kmTotal') : 0,
  tripsPerHour: sum('hoursOnline') ? sum('tripsTotal') / sum('hoursOnline') : 0,
  ticketAverage: sum('tripsTotal') ? sum('grossRevenue') / sum('tripsTotal') : 0
};

const parameters = Object.fromEntries(readSheet('Parâmetros').filter((row) => row.Parâmetro).map((row) => [row.Parâmetro, {
  value: row.Valor ?? null,
  unit: row.Unidade ?? null,
  source: row['Fonte / regra'] ?? null
}]));

const fuelings = readSheet('Abastecimentos').map((row) => {
  const date = isoDate(row.Data);
  if (!date || num(row['Total pago']) <= 0) return null;
  return {
    date,
    dateBR: dateBR(date),
    fuel: row.Combustível || 'Etanol',
    liters: round2(row.Litros),
    pricePerLiter: round2(row['Preço / L']),
    totalPaid: round2(row['Total pago']),
    kmSincePrevious: round2(row['KM desde anterior']),
    consumptionKmL: round2(row['Consumo km/L']),
    costPerKm: round2(row['Custo / km']),
    notes: row.Observações || ''
  };
}).filter(Boolean);

const expenses = readSheet('Despesas').map((row) => {
  const date = isoDate(row.Data);
  if (!date || num(row.Valor) <= 0) return null;
  return { date, dateBR: dateBR(date), category: row.Categoria || '—', description: row.Descrição || '—', value: round2(row.Valor) };
}).filter(Boolean);

const groupSummary = (key) => Object.values(monthRows.reduce((acc, row) => {
  const label = row[key] || '—';
  acc[label] ??= { label, grossRevenue: 0, profit: 0, hours: 0, trips: 0 };
  acc[label].grossRevenue += row.grossRevenue;
  acc[label].profit += row.operationalProfit;
  acc[label].hours += num(row.hoursOnline);
  acc[label].trips += row.tripsTotal;
  return acc;
}, {}));

const weekdaySummary = groupSummary('day').map((item) => ({ day: item.label, grossRevenue: round2(item.grossRevenue), profit: round2(item.profit), hours: round2(item.hours), profitPerHour: item.hours ? item.profit / item.hours : 0 }));
const platformSummary = groupSummary('platformMix').map((item) => ({ platform: item.label, revenue: round2(item.grossRevenue), trips: item.trips, ticketAverage: item.trips ? item.grossRevenue / item.trips : 0 }));

const output = {
  meta: {
    app: 'Dash Drive',
    sourceWorkbook: workbookFile,
    generatedAt: new Date().toISOString(),
    month,
    monthLabel: monthly.monthLabel,
    source: 'MotoristaOPS — Dashboard Financeiro e Logístico',
    rules: ['Planilha MotoristaOPS é a fonte operacional.', 'Todo fechamento diário deve atualizar planilha, JSON e site.', 'Reserva de manutenção pendente não integra o lucro operacional.']
  },
  parameters,
  monthly,
  latestDay,
  daily,
  weekdaySummary,
  platformSummary,
  fuelings,
  expenses
};

const json = `${JSON.stringify(output, null, 2)}\n`;
for (const target of ['src/data/motoristaops.json', 'public/data/motoristaops.json']) {
  fs.mkdirSync(path.dirname(path.join(root, target)), { recursive: true });
  fs.writeFileSync(path.join(root, target), json);
}
console.log(`OK: ${daily.length} fechamentos sincronizados de ${workbookFile}.`);
