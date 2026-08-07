export type ImportHistoryStatus = 'success' | 'partial' | 'error';

export type ImportHistoryEntry = {
  id: string;
  createdAt: string;
  source: 'uber_video' | 'excel';
  fileName: string;
  status: ImportHistoryStatus;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  message: string;
};

const STORAGE_KEY = 'motoristaops.import-history.v1';
const MAX_ENTRIES = 50;

export function listImportHistory(): ImportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return (Array.isArray(parsed) ? parsed : []).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  } catch {
    return [];
  }
}

export function addImportHistory(entry: Omit<ImportHistoryEntry, 'id' | 'createdAt'>) {
  const record: ImportHistoryEntry = { ...entry, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  const entries = [record, ...listImportHistory()].slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent('motoristaops:import-history-changed'));
  return record;
}

export function clearImportHistory() {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('motoristaops:import-history-changed'));
}

export const formatImportSource = (source: ImportHistoryEntry['source']) => source === 'uber_video' ? 'Vídeo Uber' : 'Excel';
export const formatImportStatus = (status: ImportHistoryStatus) => status === 'success' ? 'Sucesso' : status === 'partial' ? 'Parcial' : 'Erro';
