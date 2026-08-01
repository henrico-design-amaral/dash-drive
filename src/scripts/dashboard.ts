import ExcelJS from 'exceljs';
import { supabase } from '../lib/supabase';

type Closing = {
  id?: string;
  operation_date: string;
  shift?: string | null;
  primary_platform?: string | null;
  hours_online?: number | null;
  hours_in_ride?: number | null;
  km_total?: number | null;
  km_passenger?: number | null;
  trips_uber?: number;
  trips_99?: number;
  trips_private?: number;
  revenue_uber?: number;
  revenue_99?: number;
  revenue_private?: number;
  tips_extras?: number;
  fuel_cost?: number;
  food_cost?: number;
  wash_cost?: number;
  other_operational_cost?: number;
  fuel_efficiency_km_l?: number | null;
  fuel_price_reference?: number | null;
  notes?: string | null;
  source?: string;
};

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const $$ = <T extends HTMLElement>(selector: string) => [...document.querySelectorAll<T>(selector)];
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const number = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const dateBR = (iso?: string | null) => iso ? iso.split('-').reverse().join('/') : '—';
const value = (form: FormData, key: string) => {
  const raw = String(form.get(key) ?? '').trim().replace(',', '.');
  return raw === '' ? null : Number(raw);
};

let userId = '';
let closings: any[] = [];
let expenses: any[] = [];
let fuelings: any[] = [];
let goals: any[] = [];

function notify(message: string, kind: 'ok' | 'error' = 'ok') {
  const node = $('#toast');
  if (!node) return;
  node.textContent = message;
  node.dataset.kind = kind;
  node.hidden = false;
  window.setTimeout(() => { node.hidden = true; }, 3800);
}

function showApp(authenticated: boolean) {
  const auth = $('#auth-view');
  const app = $('#app-view');
  if (auth) auth.hidden = authenticated;
  if (app) app.hidden = !authenticated;
}

async function authenticate() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    showApp(false);
    return;
  }
  userId = session.user.id;
  showApp(true);
  await refreshAll();
}

async function refreshAll() {
  const [closingResult, expenseResult, fuelingResult, goalResult] = await Promise.all([
    supabase.from('daily_closings_metrics').select('*').order('operation_date', { ascending: false }),
    supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
    supabase.from('fuelings').select('*').order('fueling_date', { ascending: false }),
    supabase.from('goals').select('*').order('period_start', { ascending: false })
  ]);
  const error = closingResult.error || expenseResult.error || fuelingResult.error || goalResult.error;
  if (error) return notify(error.message, 'error');
  closings = closingResult.data ?? [];
  expenses = expenseResult.data ?? [];
  fuelings = fuelingResult.data ?? [];
  goals = goalResult.data ?? [];
  render();
}

function render() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthClosings = closings.filter(row => row.operation_date?.startsWith(month));
  const monthExpenses = expenses.filter(row => row.expense_date?.startsWith(month));
  const sum = (rows: any[], key: string) => rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
  const revenue = sum(monthClosings, 'gross_revenue');
  const operationalProfit = sum(monthClosings, 'operational_profit');
  const totalExpenses = sum(monthExpenses, 'amount');
  const hours = sum(monthClosings, 'hours_online');
  const km = sum(monthClosings, 'km_total');
  const trips = sum(monthClosings, 'trips_total');
  const realBalance = operationalProfit - totalExpenses;
  const goal = goals.find(item => item.period_type === 'monthly' && item.period_start?.startsWith(month));
  const target = Number(goal?.revenue_target ?? 0);
  const progress = target > 0 ? Math.min(100, revenue / target * 100) : 0;

  const metrics: Record<string, string> = {
    'metric-revenue': money.format(revenue),
    'metric-profit': money.format(operationalProfit),
    'metric-balance': money.format(realBalance),
    'metric-hours': `${number.format(hours)}h`,
    'metric-km': `${number.format(km)} km`,
    'metric-trips': number.format(trips),
    'metric-revenue-hour': hours ? `${money.format(revenue / hours)}/h` : '—',
    'metric-profit-hour': hours ? `${money.format(realBalance / hours)}/h` : '—'
  };
  for (const [id, text] of Object.entries(metrics)) {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  }
  const progressNode = $('#goal-progress');
  if (progressNode) progressNode.style.width = `${progress}%`;
  const progressText = $('#goal-progress-text');
  if (progressText) progressText.textContent = target ? `${number.format(progress)}% de ${money.format(target)}` : 'Defina uma meta mensal';

  const latest = closings[0];
  const latestNode = $('#latest-summary');
  if (latestNode) latestNode.innerHTML = latest ? `
    <strong>${dateBR(latest.operation_date)}</strong>
    <span>${latest.primary_platform ?? '—'} · ${latest.shift ?? '—'}</span>
    <b>${money.format(Number(latest.gross_revenue ?? 0))}</b>
    <small>${latest.trips_total ?? 0} viagens · ${number.format(latest.hours_online ?? 0)}h · ${number.format(latest.km_total ?? 0)} km</small>
  ` : '<span>Nenhum fechamento cadastrado.</span>';

  const rows = $('#closing-rows');
  if (rows) rows.innerHTML = closings.slice(0, 40).map(row => `
    <tr>
      <td>${dateBR(row.operation_date)}</td>
      <td>${row.primary_platform ?? '—'}</td>
      <td>${money.format(Number(row.gross_revenue ?? 0))}</td>
      <td>${money.format(Number(row.operational_profit ?? 0))}</td>
      <td>${number.format(row.hours_online ?? 0)}h</td>
      <td>${number.format(row.km_total ?? 0)}</td>
      <td>${row.trips_total ?? 0}</td>
      <td class="row-actions"><button data-edit-closing="${row.id}">Editar</button><button class="danger" data-delete-closing="${row.id}">Excluir</button></td>
    </tr>
  `).join('');

  const expenseRows = $('#expense-rows');
  if (expenseRows) expenseRows.innerHTML = expenses.slice(0, 30).map(row => `
    <tr><td>${dateBR(row.expense_date)}</td><td>${row.category}</td><td>${row.description}</td><td>${money.format(Number(row.amount))}</td><td class="row-actions"><button data-edit-expense="${row.id}">Editar</button><button class="danger" data-delete-expense="${row.id}">Excluir</button></td></tr>
  `).join('');

  const fuelingRows = $('#fueling-rows');
  if (fuelingRows) fuelingRows.innerHTML = fuelings.slice(0, 30).map(row => `
    <tr><td>${dateBR(row.fueling_date)}</td><td>${row.fuel_type}</td><td>${number.format(row.liters)} L</td><td>${money.format(Number(row.price_per_liter))}</td><td>${money.format(Number(row.total_paid))}</td><td class="row-actions"><button data-edit-fueling="${row.id}">Editar</button><button class="danger" data-delete-fueling="${row.id}">Excluir</button></td></tr>
  `).join('');

  renderChart(monthClosings);
}

function renderChart(rows: any[]) {
  const chart = $('#daily-chart');
  if (!chart) return;
  const ordered = [...rows].sort((a, b) => a.operation_date.localeCompare(b.operation_date));
  const max = Math.max(1, ...ordered.map(row => Number(row.gross_revenue ?? 0)));
  chart.innerHTML = ordered.map(row => {
    const height = Math.max(8, Number(row.gross_revenue ?? 0) / max * 100);
    return `<div class="chart-bar" title="${dateBR(row.operation_date)} · ${money.format(Number(row.gross_revenue ?? 0))}"><span style="height:${height}%"></span><small>${row.operation_date.slice(8)}</small></div>`;
  }).join('');
}

function closingPayload(form: HTMLFormElement): Closing {
  const data = new FormData(form);
  return {
    operation_date: String(data.get('operation_date')),
    shift: String(data.get('shift') || ''),
    primary_platform: String(data.get('primary_platform') || ''),
    hours_online: value(data, 'hours_online'),
    hours_in_ride: value(data, 'hours_in_ride'),
    km_total: value(data, 'km_total'),
    km_passenger: value(data, 'km_passenger'),
    trips_uber: value(data, 'trips_uber') ?? 0,
    trips_99: value(data, 'trips_99') ?? 0,
    trips_private: value(data, 'trips_private') ?? 0,
    revenue_uber: value(data, 'revenue_uber') ?? 0,
    revenue_99: value(data, 'revenue_99') ?? 0,
    revenue_private: value(data, 'revenue_private') ?? 0,
    tips_extras: value(data, 'tips_extras') ?? 0,
    fuel_cost: value(data, 'fuel_cost') ?? 0,
    food_cost: value(data, 'food_cost') ?? 0,
    wash_cost: value(data, 'wash_cost') ?? 0,
    other_operational_cost: value(data, 'other_operational_cost') ?? 0,
    fuel_efficiency_km_l: value(data, 'fuel_efficiency_km_l'),
    fuel_price_reference: value(data, 'fuel_price_reference'),
    notes: String(data.get('notes') || ''),
    source: 'manual'
  };
}

function fillForm(form: HTMLFormElement, row: Record<string, any>) {
  for (const [key, val] of Object.entries(row)) {
    const field = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (field) field.value = val ?? '';
  }
  const id = form.elements.namedItem('id') as HTMLInputElement | null;
  if (id) id.value = row.id ?? '';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function saveClosing(form: HTMLFormElement) {
  const payload = closingPayload(form);
  const id = String(new FormData(form).get('id') || '');
  const query = id
    ? supabase.from('daily_closings').update(payload).eq('id', id)
    : supabase.from('daily_closings').upsert({ ...payload, owner_id: userId }, { onConflict: 'owner_id,operation_date' });
  const { error } = await query;
  if (error) return notify(error.message, 'error');
  form.reset();
  notify('Fechamento salvo.');
  await refreshAll();
}

async function saveExpense(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const payload = {
    owner_id: userId,
    expense_date: String(data.get('expense_date')),
    category: String(data.get('category')),
    description: String(data.get('description')),
    amount: value(data, 'amount') ?? 0,
    scope: String(data.get('scope') || 'operational'),
    recurring: data.get('recurring') === 'on',
    notes: String(data.get('notes') || ''),
    source: 'manual'
  };
  const { error } = id ? await supabase.from('expenses').update(payload).eq('id', id) : await supabase.from('expenses').insert(payload);
  if (error) return notify(error.message, 'error');
  form.reset(); notify('Despesa salva.'); await refreshAll();
}

async function saveFueling(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const liters = value(data, 'liters') ?? 0;
  const price = value(data, 'price_per_liter') ?? 0;
  const payload = {
    owner_id: userId,
    fueling_date: String(data.get('fueling_date')),
    fuel_type: String(data.get('fuel_type') || 'Etanol'),
    liters,
    price_per_liter: price,
    total_paid: value(data, 'total_paid') ?? liters * price,
    odometer_km: value(data, 'odometer_km'),
    station: String(data.get('station') || ''),
    notes: String(data.get('notes') || ''),
    source: 'manual'
  };
  const { error } = id ? await supabase.from('fuelings').update(payload).eq('id', id) : await supabase.from('fuelings').insert(payload);
  if (error) return notify(error.message, 'error');
  form.reset(); notify('Abastecimento salvo.'); await refreshAll();
}

async function saveGoal(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const payload = {
    owner_id: userId,
    period_type: String(data.get('period_type') || 'monthly'),
    period_start: String(data.get('period_start')),
    period_end: String(data.get('period_end')),
    revenue_target: value(data, 'revenue_target'),
    profit_target: value(data, 'profit_target'),
    hours_target: value(data, 'hours_target'),
    km_target: value(data, 'km_target'),
    trips_target: value(data, 'trips_target'),
    notes: String(data.get('notes') || '')
  };
  const { error } = id ? await supabase.from('goals').update(payload).eq('id', id) : await supabase.from('goals').insert(payload);
  if (error) return notify(error.message, 'error');
  form.reset(); notify('Meta salva.'); await refreshAll();
}

const normalizeHeader = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const numCell = (v: any) => typeof v === 'number' ? v : Number(String(v ?? '').replace(/R\$/g, '').replace(/\./g, '').replace(',', '.')) || 0;
const dateCell = (v: any) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const match = String(v ?? '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : String(v ?? '').slice(0, 10);
};

async function importExcel(file: File) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const sheet = workbook.getWorksheet('Operação Diária') ?? workbook.worksheets[0];
  if (!sheet) throw new Error('Nenhuma aba encontrada.');
  const headers = (sheet.getRow(1).values as any[]).slice(1).map(v => normalizeHeader(String(v ?? '')));
  const records: any[] = [];
  sheet.eachRow((row, index) => {
    if (index === 1) return;
    const cells = (row.values as any[]).slice(1);
    const raw = Object.fromEntries(headers.map((header, i) => [header, cells[i]]));
    const operationDate = dateCell(raw.data);
    if (!operationDate || !raw['receita bruta']) return;
    records.push({
      owner_id: userId,
      operation_date: operationDate,
      weekday_label: raw.dia ?? null,
      shift: raw.turno ?? null,
      primary_platform: raw['plataforma principal'] ?? null,
      hours_online: numCell(raw['horas online']),
      hours_in_ride: numCell(raw['horas em corrida']),
      km_total: numCell(raw['km total']),
      km_passenger: numCell(raw['km com passageiro']) || null,
      trips_uber: Math.trunc(numCell(raw['corridas uber'])),
      trips_99: Math.trunc(numCell(raw['corridas 99'])),
      trips_private: Math.trunc(numCell(raw['corridas particular'])),
      revenue_uber: numCell(raw['ganhos uber']),
      revenue_99: numCell(raw['ganhos 99']),
      revenue_private: numCell(raw['ganhos particular']),
      tips_extras: numCell(raw['gorjetas / extras']),
      fuel_cost: numCell(raw['combustivel estimado']),
      food_cost: numCell(raw.alimentacao),
      wash_cost: numCell(raw.lavagem),
      other_operational_cost: Math.max(0, numCell(raw['despesa operacional']) - numCell(raw['combustivel estimado']) - numCell(raw.alimentacao) - numCell(raw.lavagem)),
      notes: String(raw.observacoes ?? ''),
      source: 'excel'
    });
  });
  const { error } = await supabase.from('daily_closings').upsert(records, { onConflict: 'owner_id,operation_date' });
  if (error) throw error;
  notify(`${records.length} fechamentos importados do Excel.`);
  await refreshAll();
}

async function exportCsv() {
  const headers = ['Data','Plataforma','Receita','Lucro','Horas','KM','Viagens'];
  const lines = closings.map(row => [row.operation_date,row.primary_platform,row.gross_revenue,row.operational_profit,row.hours_online,row.km_total,row.trips_total].join(';'));
  const blob = new Blob(['\ufeff' + [headers.join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url; anchor.download = 'motoristaops-fechamentos.csv'; anchor.click(); URL.revokeObjectURL(url);
}

function bind() {
  $('#login-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget as HTMLFormElement).get('email'));
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    error ? notify(error.message, 'error') : notify('Link de acesso enviado para seu e-mail.');
  });
  $('#logout')?.addEventListener('click', async () => { await supabase.auth.signOut(); window.location.reload(); });
  $('#closing-form')?.addEventListener('submit', event => { event.preventDefault(); saveClosing(event.currentTarget as HTMLFormElement); });
  $('#expense-form')?.addEventListener('submit', event => { event.preventDefault(); saveExpense(event.currentTarget as HTMLFormElement); });
  $('#fueling-form')?.addEventListener('submit', event => { event.preventDefault(); saveFueling(event.currentTarget as HTMLFormElement); });
  $('#goal-form')?.addEventListener('submit', event => { event.preventDefault(); saveGoal(event.currentTarget as HTMLFormElement); });
  $('#excel-file')?.addEventListener('change', async event => {
    const file = (event.currentTarget as HTMLInputElement).files?.[0];
    if (!file) return;
    try { await importExcel(file); } catch (error: any) { notify(error.message ?? 'Falha ao importar Excel.', 'error'); }
  });
  $('#export-data')?.addEventListener('click', exportCsv);
  document.addEventListener('click', async event => {
    const target = event.target as HTMLElement;
    const editClosing = target.dataset.editClosing;
    const deleteClosing = target.dataset.deleteClosing;
    const editExpense = target.dataset.editExpense;
    const deleteExpense = target.dataset.deleteExpense;
    const editFueling = target.dataset.editFueling;
    const deleteFueling = target.dataset.deleteFueling;
    if (editClosing) fillForm($('#closing-form')!, closings.find(row => row.id === editClosing));
    if (editExpense) fillForm($('#expense-form')!, expenses.find(row => row.id === editExpense));
    if (editFueling) fillForm($('#fueling-form')!, fuelings.find(row => row.id === editFueling));
    if (deleteClosing && confirm('Excluir este fechamento?')) await supabase.from('daily_closings').delete().eq('id', deleteClosing);
    if (deleteExpense && confirm('Excluir esta despesa?')) await supabase.from('expenses').delete().eq('id', deleteExpense);
    if (deleteFueling && confirm('Excluir este abastecimento?')) await supabase.from('fuelings').delete().eq('id', deleteFueling);
    if (deleteClosing || deleteExpense || deleteFueling) await refreshAll();
    const section = target.closest<HTMLElement>('[data-section]')?.dataset.section;
    if (section) {
      $$('.workspace-section').forEach(node => node.hidden = node.id !== section);
      $$('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.section === section));
    }
  });
}

bind();
authenticate();
supabase.auth.onAuthStateChange(() => authenticate());
