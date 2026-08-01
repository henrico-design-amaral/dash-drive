import { supabase } from '../lib/supabase';

type Row = Record<string, any>;
type Closing = {
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
const escapeHtml = (input: unknown) => String(input ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
const dateBR = (iso?: string | null) => iso ? iso.split('-').reverse().join('/') : '—';
const numeric = (form: FormData, key: string) => {
  const raw = String(form.get(key) ?? '').trim().replace(',', '.');
  if (raw === '') return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
};

let userId = '';
let closings: Row[] = [];
let expenses: Row[] = [];
let fuelings: Row[] = [];
let goals: Row[] = [];
let vehicles: Row[] = [];
let refreshing = false;

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

function setBusy(busy: boolean) {
  document.body.dataset.loading = String(busy);
  $$<HTMLButtonElement>('button').forEach(button => { button.disabled = busy; });
}

async function authenticate() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) notify(error.message, 'error');
  if (!session) {
    userId = '';
    showApp(false);
    return;
  }
  userId = session.user.id;
  showApp(true);
  await refreshAll();
}

async function refreshAll() {
  if (!userId || refreshing) return;
  refreshing = true;
  setBusy(true);
  try {
    const [closingResult, expenseResult, fuelingResult, goalResult, vehicleResult] = await Promise.all([
      supabase.from('daily_closings_metrics').select('*').order('operation_date', { ascending: false }),
      supabase.from('expenses').select('*').order('expense_date', { ascending: false }),
      supabase.from('fuelings').select('*').order('fueling_date', { ascending: false }),
      supabase.from('goals').select('*').order('period_start', { ascending: false }),
      supabase.from('vehicles').select('*').order('active', { ascending: false }).order('created_at', { ascending: false })
    ]);
    const error = closingResult.error || expenseResult.error || fuelingResult.error || goalResult.error || vehicleResult.error;
    if (error) throw error;
    closings = closingResult.data ?? [];
    expenses = expenseResult.data ?? [];
    fuelings = fuelingResult.data ?? [];
    goals = goalResult.data ?? [];
    vehicles = vehicleResult.data ?? [];
    render();
  } catch (error: any) {
    notify(error?.message ?? 'Falha ao carregar os dados.', 'error');
  } finally {
    refreshing = false;
    setBusy(false);
  }
}

function emptyRow(columns: number, message: string) {
  return `<tr><td colspan="${columns}" class="muted">${escapeHtml(message)}</td></tr>`;
}

function render() {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthClosings = closings.filter(row => row.operation_date?.startsWith(month));
  const monthExpenses = expenses.filter(row => row.expense_date?.startsWith(month));
  const sum = (rows: Row[], key: string) => rows.reduce((total, row) => total + Number(row[key] ?? 0), 0);
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
  Object.entries(metrics).forEach(([id, text]) => {
    const node = document.getElementById(id);
    if (node) node.textContent = text;
  });
  const progressNode = $('#goal-progress');
  if (progressNode) progressNode.style.width = `${progress}%`;
  const progressText = $('#goal-progress-text');
  if (progressText) progressText.textContent = target ? `${number.format(progress)}% de ${money.format(target)}` : 'Defina uma meta mensal';

  const latest = closings[0];
  const latestNode = $('#latest-summary');
  if (latestNode) latestNode.innerHTML = latest ? `
    <strong>${dateBR(latest.operation_date)}</strong>
    <span>${escapeHtml(latest.primary_platform || '—')} · ${escapeHtml(latest.shift || '—')}</span>
    <b>${money.format(Number(latest.gross_revenue ?? 0))}</b>
    <small>${Number(latest.trips_total ?? 0)} viagens · ${number.format(latest.hours_online ?? 0)}h · ${number.format(latest.km_total ?? 0)} km</small>
  ` : '<span>Nenhum fechamento cadastrado.</span>';

  const closingRows = $('#closing-rows');
  if (closingRows) closingRows.innerHTML = closings.length ? closings.slice(0, 100).map(row => `
    <tr><td>${dateBR(row.operation_date)}</td><td>${escapeHtml(row.primary_platform || '—')}</td><td>${money.format(Number(row.gross_revenue ?? 0))}</td><td>${money.format(Number(row.operational_profit ?? 0))}</td><td>${number.format(row.hours_online ?? 0)}h</td><td>${number.format(row.km_total ?? 0)}</td><td>${Number(row.trips_total ?? 0)}</td><td class="row-actions"><button data-edit-closing="${row.id}">Editar</button><button class="danger" data-delete-closing="${row.id}">Excluir</button></td></tr>
  `).join('') : emptyRow(8, 'Nenhum fechamento cadastrado.');

  const expenseRows = $('#expense-rows');
  if (expenseRows) expenseRows.innerHTML = expenses.length ? expenses.slice(0, 100).map(row => `
    <tr><td>${dateBR(row.expense_date)}</td><td>${escapeHtml(row.category)}</td><td>${escapeHtml(row.description)}</td><td>${money.format(Number(row.amount))}</td><td class="row-actions"><button data-edit-expense="${row.id}">Editar</button><button class="danger" data-delete-expense="${row.id}">Excluir</button></td></tr>
  `).join('') : emptyRow(5, 'Nenhuma despesa cadastrada.');

  const fuelingRows = $('#fueling-rows');
  if (fuelingRows) fuelingRows.innerHTML = fuelings.length ? fuelings.slice(0, 100).map(row => `
    <tr><td>${dateBR(row.fueling_date)}</td><td>${escapeHtml(row.fuel_type)}</td><td>${number.format(row.liters)} L</td><td>${money.format(Number(row.price_per_liter))}</td><td>${money.format(Number(row.total_paid))}</td><td class="row-actions"><button data-edit-fueling="${row.id}">Editar</button><button class="danger" data-delete-fueling="${row.id}">Excluir</button></td></tr>
  `).join('') : emptyRow(6, 'Nenhum abastecimento cadastrado.');

  const vehicleRows = $('#vehicle-rows');
  if (vehicleRows) vehicleRows.innerHTML = vehicles.length ? vehicles.map(row => `
    <tr><td><strong>${escapeHtml(row.nickname || `${row.make} ${row.model}`)}</strong><br><small>${escapeHtml(row.make)} ${escapeHtml(row.model)}</small></td><td>${row.model_year ?? '—'}</td><td>${escapeHtml(row.plate || '—')}</td><td>${escapeHtml(row.fuel_type || '—')}</td><td>${row.active ? 'Ativo' : 'Inativo'}</td><td class="row-actions"><button data-edit-vehicle="${row.id}">Editar</button><button class="danger" data-delete-vehicle="${row.id}">Excluir</button></td></tr>
  `).join('') : emptyRow(6, 'Nenhum veículo cadastrado.');

  const goalRows = $('#goal-rows');
  if (goalRows) goalRows.innerHTML = goals.length ? goals.map(row => `
    <tr><td>${escapeHtml(row.period_type)}</td><td>${dateBR(row.period_start)} a ${dateBR(row.period_end)}</td><td>${row.revenue_target == null ? '—' : money.format(Number(row.revenue_target))}</td><td>${row.profit_target == null ? '—' : money.format(Number(row.profit_target))}</td><td>${row.hours_target == null ? '—' : `${number.format(row.hours_target)}h`}</td><td class="row-actions"><button data-edit-goal="${row.id}">Editar</button><button class="danger" data-delete-goal="${row.id}">Excluir</button></td></tr>
  `).join('') : emptyRow(6, 'Nenhuma meta cadastrada.');

  renderChart(monthClosings);
}

function renderChart(rows: Row[]) {
  const chart = $('#daily-chart');
  if (!chart) return;
  if (!rows.length) {
    chart.innerHTML = '<p class="muted">Nenhum fechamento no mês atual.</p>';
    return;
  }
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
    hours_online: numeric(data, 'hours_online'),
    hours_in_ride: numeric(data, 'hours_in_ride'),
    km_total: numeric(data, 'km_total'),
    km_passenger: numeric(data, 'km_passenger'),
    trips_uber: numeric(data, 'trips_uber') ?? 0,
    trips_99: numeric(data, 'trips_99') ?? 0,
    trips_private: numeric(data, 'trips_private') ?? 0,
    revenue_uber: numeric(data, 'revenue_uber') ?? 0,
    revenue_99: numeric(data, 'revenue_99') ?? 0,
    revenue_private: numeric(data, 'revenue_private') ?? 0,
    tips_extras: numeric(data, 'tips_extras') ?? 0,
    fuel_cost: numeric(data, 'fuel_cost') ?? 0,
    food_cost: numeric(data, 'food_cost') ?? 0,
    wash_cost: numeric(data, 'wash_cost') ?? 0,
    other_operational_cost: numeric(data, 'other_operational_cost') ?? 0,
    fuel_efficiency_km_l: numeric(data, 'fuel_efficiency_km_l'),
    fuel_price_reference: numeric(data, 'fuel_price_reference'),
    notes: String(data.get('notes') || ''),
    source: 'manual'
  };
}

function fillForm(form: HTMLFormElement | null, row?: Row) {
  if (!form || !row) return;
  Object.entries(row).forEach(([key, val]) => {
    const field = form.elements.namedItem(key) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (!field) return;
    if (field instanceof HTMLInputElement && field.type === 'checkbox') field.checked = Boolean(val);
    else field.value = val ?? '';
  });
  const id = form.elements.namedItem('id') as HTMLInputElement | null;
  if (id) id.value = row.id ?? '';
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function runMutation(action: () => Promise<{ error: any }>, success: string, form?: HTMLFormElement) {
  setBusy(true);
  try {
    const { error } = await action();
    if (error) throw error;
    form?.reset();
    notify(success);
    await refreshAll();
  } catch (error: any) {
    notify(error?.message ?? 'Operação não concluída.', 'error');
  } finally {
    setBusy(false);
  }
}

async function saveClosing(form: HTMLFormElement) {
  const payload = closingPayload(form);
  const id = String(new FormData(form).get('id') || '');
  await runMutation(async () => id
    ? await supabase.from('daily_closings').update(payload).eq('id', id)
    : await supabase.from('daily_closings').upsert({ ...payload, owner_id: userId }, { onConflict: 'owner_id,operation_date' }), 'Fechamento salvo.', form);
}

async function saveExpense(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const payload = { owner_id: userId, expense_date: String(data.get('expense_date')), category: String(data.get('category')), description: String(data.get('description')), amount: numeric(data, 'amount') ?? 0, scope: String(data.get('scope') || 'operational'), recurring: data.get('recurring') === 'on', notes: String(data.get('notes') || ''), source: 'manual' };
  await runMutation(async () => id ? await supabase.from('expenses').update(payload).eq('id', id) : await supabase.from('expenses').insert(payload), 'Despesa salva.', form);
}

async function saveFueling(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const liters = numeric(data, 'liters') ?? 0;
  const price = numeric(data, 'price_per_liter') ?? 0;
  const payload = { owner_id: userId, fueling_date: String(data.get('fueling_date')), fuel_type: String(data.get('fuel_type') || 'Etanol'), liters, price_per_liter: price, total_paid: numeric(data, 'total_paid') ?? liters * price, odometer_km: numeric(data, 'odometer_km'), station: String(data.get('station') || ''), notes: String(data.get('notes') || ''), source: 'manual' };
  await runMutation(async () => id ? await supabase.from('fuelings').update(payload).eq('id', id) : await supabase.from('fuelings').insert(payload), 'Abastecimento salvo.', form);
}

async function saveVehicle(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const payload = { owner_id: userId, nickname: String(data.get('nickname') || ''), make: String(data.get('make') || ''), model: String(data.get('model') || ''), model_year: numeric(data, 'model_year'), plate: String(data.get('plate') || '').trim().toUpperCase() || null, fuel_type: String(data.get('fuel_type') || ''), initial_odometer_km: numeric(data, 'initial_odometer_km'), active: data.get('active') === 'on', notes: String(data.get('notes') || '') };
  await runMutation(async () => id ? await supabase.from('vehicles').update(payload).eq('id', id) : await supabase.from('vehicles').insert(payload), 'Veículo salvo.', form);
}

async function saveGoal(form: HTMLFormElement) {
  const data = new FormData(form);
  const id = String(data.get('id') || '');
  const payload = { owner_id: userId, period_type: String(data.get('period_type') || 'monthly'), period_start: String(data.get('period_start')), period_end: String(data.get('period_end')), revenue_target: numeric(data, 'revenue_target'), profit_target: numeric(data, 'profit_target'), hours_target: numeric(data, 'hours_target'), km_target: numeric(data, 'km_target'), trips_target: numeric(data, 'trips_target'), notes: String(data.get('notes') || '') };
  await runMutation(async () => id ? await supabase.from('goals').update(payload).eq('id', id) : await supabase.from('goals').insert(payload), 'Meta salva.', form);
}

const normalizeHeader = (text: string) => text.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const numCell = (v: any) => typeof v === 'number' ? v : Number(String(v ?? '').replace(/R\$/g, '').replace(/\./g, '').replace(',', '.')) || 0;
const dateCell = (v: any) => {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  const match = String(v ?? '').match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : String(v ?? '').slice(0, 10);
};

async function importExcel(file: File) {
  setBusy(true);
  try {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.getWorksheet('Operação Diária') ?? workbook.worksheets[0];
    if (!sheet) throw new Error('Nenhuma aba encontrada.');
    const headers = (sheet.getRow(1).values as any[]).slice(1).map(v => normalizeHeader(String(v ?? '')));
    const records: Row[] = [];
    sheet.eachRow((row, index) => {
      if (index === 1) return;
      const cells = (row.values as any[]).slice(1);
      const raw = Object.fromEntries(headers.map((header, i) => [header, cells[i]]));
      const operationDate = dateCell(raw.data);
      if (!operationDate || !raw['receita bruta']) return;
      records.push({ owner_id: userId, operation_date: operationDate, weekday_label: raw.dia ?? null, shift: raw.turno ?? null, primary_platform: raw['plataforma principal'] ?? null, hours_online: numCell(raw['horas online']), hours_in_ride: numCell(raw['horas em corrida']), km_total: numCell(raw['km total']), km_passenger: numCell(raw['km com passageiro']) || null, trips_uber: Math.trunc(numCell(raw['corridas uber'])), trips_99: Math.trunc(numCell(raw['corridas 99'])), trips_private: Math.trunc(numCell(raw['corridas particular'])), revenue_uber: numCell(raw['ganhos uber']), revenue_99: numCell(raw['ganhos 99']), revenue_private: numCell(raw['ganhos particular']), tips_extras: numCell(raw['gorjetas / extras']), fuel_cost: numCell(raw['combustivel estimado']), food_cost: numCell(raw.alimentacao), wash_cost: numCell(raw.lavagem), other_operational_cost: Math.max(0, numCell(raw['despesa operacional']) - numCell(raw['combustivel estimado']) - numCell(raw.alimentacao) - numCell(raw.lavagem)), notes: String(raw.observacoes ?? ''), source: 'excel' });
    });
    if (!records.length) throw new Error('Nenhum fechamento válido foi encontrado na planilha.');
    const { error } = await supabase.from('daily_closings').upsert(records, { onConflict: 'owner_id,operation_date' });
    if (error) throw error;
    notify(`${records.length} fechamentos conciliados do Excel.`);
    await refreshAll();
  } catch (error: any) {
    notify(error?.message ?? 'Falha ao importar Excel.', 'error');
  } finally {
    setBusy(false);
  }
}

function csvCell(input: unknown) {
  const text = String(input ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function exportCsv() {
  const headers = ['Data','Plataforma','Receita','Lucro','Horas','KM','Viagens'];
  const lines = closings.map(row => [row.operation_date,row.primary_platform,row.gross_revenue,row.operational_profit,row.hours_online,row.km_total,row.trips_total].map(csvCell).join(';'));
  const blob = new Blob(['\ufeff' + [headers.map(csvCell).join(';'), ...lines].join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `motoristaops-fechamentos-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function remove(table: string, id: string, label: string) {
  if (!window.confirm(`Excluir ${label}?`)) return;
  await runMutation(async () => await supabase.from(table).delete().eq('id', id), `${label} excluído.`);
}

function bindFileInput(selector: string) {
  $(selector)?.addEventListener('change', async event => {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await importExcel(file);
    input.value = '';
  });
}

function bind() {
  $('#login-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget as HTMLFormElement).get('email'));
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    error ? notify(error.message, 'error') : notify('Link de acesso enviado para seu e-mail.');
  });
  $('#logout')?.addEventListener('click', async () => { await supabase.auth.signOut(); showApp(false); });
  $('#closing-form')?.addEventListener('submit', event => { event.preventDefault(); void saveClosing(event.currentTarget as HTMLFormElement); });
  $('#expense-form')?.addEventListener('submit', event => { event.preventDefault(); void saveExpense(event.currentTarget as HTMLFormElement); });
  $('#fueling-form')?.addEventListener('submit', event => { event.preventDefault(); void saveFueling(event.currentTarget as HTMLFormElement); });
  $('#vehicle-form')?.addEventListener('submit', event => { event.preventDefault(); void saveVehicle(event.currentTarget as HTMLFormElement); });
  $('#goal-form')?.addEventListener('submit', event => { event.preventDefault(); void saveGoal(event.currentTarget as HTMLFormElement); });
  bindFileInput('#excel-file');
  bindFileInput('#excel-file-secondary');
  $('#export-data')?.addEventListener('click', exportCsv);
  $('#export-data-secondary')?.addEventListener('click', exportCsv);

  document.addEventListener('click', event => {
    const target = event.target as HTMLElement;
    const find = (rows: Row[], id?: string) => rows.find(row => row.id === id);
    if (target.dataset.editClosing) fillForm($('#closing-form'), find(closings, target.dataset.editClosing));
    if (target.dataset.editExpense) fillForm($('#expense-form'), find(expenses, target.dataset.editExpense));
    if (target.dataset.editFueling) fillForm($('#fueling-form'), find(fuelings, target.dataset.editFueling));
    if (target.dataset.editVehicle) fillForm($('#vehicle-form'), find(vehicles, target.dataset.editVehicle));
    if (target.dataset.editGoal) fillForm($('#goal-form'), find(goals, target.dataset.editGoal));
    if (target.dataset.deleteClosing) void remove('daily_closings', target.dataset.deleteClosing, 'este fechamento');
    if (target.dataset.deleteExpense) void remove('expenses', target.dataset.deleteExpense, 'esta despesa');
    if (target.dataset.deleteFueling) void remove('fuelings', target.dataset.deleteFueling, 'este abastecimento');
    if (target.dataset.deleteVehicle) void remove('vehicles', target.dataset.deleteVehicle, 'este veículo');
    if (target.dataset.deleteGoal) void remove('goals', target.dataset.deleteGoal, 'esta meta');
    const section = target.closest<HTMLElement>('[data-section]')?.dataset.section;
    if (section) {
      $$('.workspace-section').forEach(node => { node.hidden = node.id !== section; });
      $$('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.section === section));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

bind();
void authenticate();
supabase.auth.onAuthStateChange((_event, session) => {
  if (!session) {
    userId = '';
    showApp(false);
    return;
  }
  if (session.user.id !== userId) {
    userId = session.user.id;
    showApp(true);
    void refreshAll();
  }
});