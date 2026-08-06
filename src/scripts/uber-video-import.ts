import { supabase } from '../lib/supabase';

type ParsedRow = {
  selected: boolean;
  operation_date: string;
  revenue_uber: number | null;
  trips_uber: number | null;
  confidence: number;
  sourceText: string;
};

declare global {
  interface Window { Tesseract?: any; }
}

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const fileInput = $('#uber-video-file') as HTMLInputElement | null;
const video = $('#uber-video') as HTMLVideoElement | null;
const canvas = $('#uber-frame-canvas') as HTMLCanvasElement | null;
const processButton = $('#process-uber-video') as HTMLButtonElement | null;
const intervalSelect = $('#frame-interval') as HTMLSelectElement | null;
const metadata = $('#video-metadata');
const workspace = $('#import-workspace');
const authWarning = $('#import-auth-warning');
const reviewSection = $('#review-section');
const reviewRows = $('#uber-review-rows');
const reviewSummary = $('#review-summary');
const progressBar = $('#progress-bar') as HTMLProgressElement | null;
const progressLabel = $('#progress-label');
const progressValue = $('#progress-value');
const importLog = $('#import-log');

let objectUrl = '';
let parsedRows: ParsedRow[] = [];
let ownerId = '';

function setProgress(value: number, label: string) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  if (progressBar) progressBar.value = normalized;
  if (progressValue) progressValue.textContent = `${normalized}%`;
  if (progressLabel) progressLabel.textContent = label;
}

function showLog(message: string, kind: 'ok' | 'error' = 'ok') {
  if (!importLog) return;
  importLog.hidden = false;
  importLog.dataset.kind = kind;
  importLog.textContent = message;
}

function formatBytes(bytes: number) {
  if (!bytes) return '0 MB';
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function waitForEvent(target: EventTarget, event: string) {
  return new Promise<void>((resolve, reject) => {
    const success = () => { cleanup(); resolve(); };
    const failure = () => { cleanup(); reject(new Error(`Falha ao carregar evento ${event}.`)); };
    const cleanup = () => {
      target.removeEventListener(event, success);
      target.removeEventListener('error', failure);
    };
    target.addEventListener(event, success, { once: true });
    target.addEventListener('error', failure, { once: true });
  });
}

async function seekTo(seconds: number) {
  if (!video) return;
  if (Math.abs(video.currentTime - seconds) < 0.01) return;
  video.currentTime = seconds;
  await waitForEvent(video, 'seeked');
}

function imageSignature(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const sampleW = 32;
  const sampleH = 18;
  const temp = document.createElement('canvas');
  temp.width = sampleW;
  temp.height = sampleH;
  const tctx = temp.getContext('2d');
  if (!tctx) return [] as number[];
  tctx.drawImage(ctx.canvas, 0, 0, width, height, 0, 0, sampleW, sampleH);
  const pixels = tctx.getImageData(0, 0, sampleW, sampleH).data;
  const values: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) values.push((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
  return values;
}

function signatureDifference(a: number[], b: number[]) {
  if (!a.length || !b.length || a.length !== b.length) return 1;
  let total = 0;
  for (let i = 0; i < a.length; i += 1) total += Math.abs(a[i] - b[i]);
  return total / a.length / 255;
}

function normalizeDate(day: string, month: string, year?: string) {
  const currentYear = new Date().getFullYear();
  const fullYear = year ? (year.length === 2 ? `20${year}` : year) : String(currentYear);
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function parseText(text: string): ParsedRow[] {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const dateMatches = [...clean.matchAll(/\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/g)];
  const moneyMatches = [...clean.matchAll(/R\$\s*([\d.]+,\d{2})/gi)];
  const tripMatch = clean.match(/(\d{1,3})\s*(?:viagens?|corridas?)/i);
  if (!dateMatches.length && !moneyMatches.length) return [];
  const date = dateMatches[0] ? normalizeDate(dateMatches[0][1], dateMatches[0][2], dateMatches[0][3]) : '';
  const values = moneyMatches.map(match => Number(match[1].replace(/\./g, '').replace(',', '.'))).filter(value => Number.isFinite(value) && value > 0 && value < 100000);
  const revenue = values.length ? Math.max(...values) : null;
  const trips = tripMatch ? Number(tripMatch[1]) : null;
  let confidence = 0.25;
  if (date) confidence += 0.3;
  if (revenue != null) confidence += 0.35;
  if (trips != null) confidence += 0.1;
  return [{ selected: true, operation_date: date, revenue_uber: revenue, trips_uber: trips, confidence: Math.min(1, confidence), sourceText: clean.slice(0, 220) }];
}

function deduplicate(rows: ParsedRow[]) {
  const map = new Map<string, ParsedRow>();
  for (const row of rows) {
    const key = `${row.operation_date}|${row.revenue_uber ?? ''}|${row.trips_uber ?? ''}`;
    const current = map.get(key);
    if (!current || row.confidence > current.confidence) map.set(key, row);
  }
  return [...map.values()];
}

function renderRows() {
  if (!reviewRows || !reviewSection) return;
  reviewSection.hidden = false;
  reviewRows.innerHTML = parsedRows.map((row, index) => {
    const level = row.confidence >= .75 ? 'high' : row.confidence >= .5 ? 'medium' : 'low';
    return `<tr data-index="${index}"><td><input type="checkbox" data-field="selected" ${row.selected ? 'checked' : ''}></td><td><input type="date" data-field="operation_date" value="${row.operation_date}"></td><td><input type="number" step="0.01" min="0" data-field="revenue_uber" value="${row.revenue_uber ?? ''}"></td><td><input type="number" min="0" data-field="trips_uber" value="${row.trips_uber ?? ''}"></td><td><span class="confidence" data-level="${level}">${Math.round(row.confidence * 100)}%</span></td><td title="${row.sourceText.replace(/"/g, '&quot;')}">${row.sourceText || 'Linha manual'}</td></tr>`;
  }).join('');
  if (reviewSummary) reviewSummary.textContent = `${parsedRows.length} linha(s) encontrada(s). Revise antes de importar.`;
}

async function processVideo() {
  if (!video || !canvas || !window.Tesseract) { showLog('A biblioteca de OCR ainda não foi carregada. Recarregue a página e tente novamente.', 'error'); return; }
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context || !Number.isFinite(video.duration)) return;
  processButton!.disabled = true;
  showLog('Processamento iniciado. Mantenha esta aba aberta.');
  const interval = Number(intervalSelect?.value || 1.5);
  const totalFrames = Math.min(160, Math.max(1, Math.ceil(video.duration / interval)));
  const step = video.duration / totalFrames;
  let previousSignature: number[] = [];
  const results: ParsedRow[] = [];
  try {
    for (let index = 0; index < totalFrames; index += 1) {
      setProgress((index / totalFrames) * 100, `Lendo quadro ${index + 1} de ${totalFrames}`);
      await seekTo(Math.max(0, Math.min(video.duration - 0.05, index * step)));
      const scale = Math.min(1, 900 / video.videoWidth);
      canvas.width = Math.max(320, Math.round(video.videoWidth * scale));
      canvas.height = Math.max(568, Math.round(video.videoHeight * scale));
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const signature = imageSignature(context, canvas.width, canvas.height);
      const difference = signatureDifference(previousSignature, signature);
      previousSignature = signature;
      if (index > 0 && difference < 0.035) continue;
      const { data } = await window.Tesseract.recognize(canvas, 'por', { logger: () => undefined });
      results.push(...parseText(String(data?.text || '')));
    }
    parsedRows = deduplicate(results);
    if (!parsedRows.length) parsedRows = [{ selected: true, operation_date: '', revenue_uber: null, trips_uber: null, confidence: .2, sourceText: 'Nenhum padrão confiável encontrado. Preencha manualmente.' }];
    renderRows();
    setProgress(100, 'Processamento concluído');
    showLog('Processamento concluído. Revise cada linha antes de importar.', 'ok');
  } catch (error: any) {
    showLog(error?.message || 'Não foi possível processar a gravação.', 'error');
    setProgress(0, 'Falha no processamento');
  } finally { processButton!.disabled = false; }
}

async function importRows() {
  const selected = parsedRows.filter(row => row.selected && row.operation_date && row.revenue_uber != null);
  if (!selected.length) { showLog('Nenhuma linha válida selecionada. Informe pelo menos data e receita.', 'error'); return; }
  const payload = selected.map(row => ({ owner_id: ownerId, operation_date: row.operation_date, primary_platform: 'Uber', trips_uber: row.trips_uber ?? 0, trips_99: 0, trips_private: 0, revenue_uber: row.revenue_uber ?? 0, revenue_99: 0, revenue_private: 0, tips_extras: 0, fuel_cost: 0, food_cost: 0, wash_cost: 0, other_operational_cost: 0, notes: 'Importado de gravação da tela da Uber; revisar métricas complementares.', source: 'uber_video_ocr' }));
  const { error } = await supabase.from('daily_closings').upsert(payload, { onConflict: 'owner_id,operation_date' });
  if (error) { showLog(error.message, 'error'); return; }
  showLog(`${payload.length} fechamento(s) importado(s). Volte ao painel para revisar horas, km e custos.`, 'ok');
}

fileInput?.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file || !video) return;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  video.src = objectUrl;
  await waitForEvent(video, 'loadedmetadata');
  if (metadata) metadata.innerHTML = `<div><dt>Arquivo</dt><dd>${file.name}</dd></div><div><dt>Tamanho</dt><dd>${formatBytes(file.size)}</dd></div><div><dt>Duração</dt><dd>${Math.round(video.duration)} s</dd></div><div><dt>Resolução</dt><dd>${video.videoWidth} × ${video.videoHeight}</dd></div>`;
  if (processButton) processButton.disabled = false;
  setProgress(0, 'Vídeo pronto para processar');
});

reviewRows?.addEventListener('input', event => {
  const target = event.target as HTMLInputElement;
  const row = target.closest<HTMLTableRowElement>('tr[data-index]');
  if (!row) return;
  const index = Number(row.dataset.index);
  const field = target.dataset.field as keyof ParsedRow | undefined;
  if (!field || !parsedRows[index]) return;
  if (field === 'selected') parsedRows[index].selected = target.checked;
  else if (field === 'revenue_uber') parsedRows[index].revenue_uber = target.value === '' ? null : Number(target.value);
  else if (field === 'trips_uber') parsedRows[index].trips_uber = target.value === '' ? null : Number(target.value);
  else if (field === 'operation_date') parsedRows[index].operation_date = target.value;
});

$('#add-review-row')?.addEventListener('click', () => { parsedRows.push({ selected: true, operation_date: '', revenue_uber: null, trips_uber: null, confidence: .1, sourceText: 'Linha manual' }); renderRows(); });
processButton?.addEventListener('click', processVideo);
$('#import-reviewed-data')?.addEventListener('click', importRows);

const dropzone = document.querySelector<HTMLElement>('.uber-dropzone');
['dragenter', 'dragover'].forEach(name => dropzone?.addEventListener(name, event => { event.preventDefault(); dropzone.dataset.dragging = 'true'; }));
['dragleave', 'drop'].forEach(name => dropzone?.addEventListener(name, event => { event.preventDefault(); dropzone.dataset.dragging = 'false'; }));
dropzone?.addEventListener('drop', event => {
  const file = (event as DragEvent).dataTransfer?.files?.[0];
  if (!file || !fileInput) return;
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  fileInput.dispatchEvent(new Event('change'));
});

(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  ownerId = session?.user.id || '';
  if (workspace) workspace.hidden = !ownerId;
  if (authWarning) authWarning.hidden = Boolean(ownerId);
})();
