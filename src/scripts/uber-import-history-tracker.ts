import { addImportHistory } from '../lib/import-history';

const importButton = document.querySelector<HTMLButtonElement>('#import-reviewed-data');
const fileInput = document.querySelector<HTMLInputElement>('#uber-video-file');
const importLog = document.querySelector<HTMLElement>('#import-log');
let pending = false;
let recordedMessage = '';

function selectedCounts() {
  const rows = [...document.querySelectorAll<HTMLTableRowElement>('#uber-review-rows tr[data-index]')];
  const selected = rows.filter(row => row.querySelector<HTMLInputElement>('input[data-field="selected"]')?.checked).length;
  return { selected, skipped: Math.max(0, rows.length - selected) };
}

importButton?.addEventListener('click', () => {
  pending = true;
  recordedMessage = '';
});

if (importLog) {
  new MutationObserver(() => {
    if (!pending || importLog.hidden) return;
    const message = importLog.textContent?.trim() || '';
    if (!message || message === recordedMessage) return;
    const isSuccess = /fechamento\(s\) importado\(s\)/i.test(message);
    const isFailure = importLog.dataset.kind === 'error';
    if (!isSuccess && !isFailure) return;
    const { selected, skipped } = selectedCounts();
    addImportHistory({
      source: 'uber_video',
      fileName: fileInput?.files?.[0]?.name || 'gravação Uber',
      status: isFailure ? 'error' : skipped ? 'partial' : 'success',
      importedCount: isSuccess ? selected : 0,
      skippedCount: skipped,
      errorCount: isFailure ? Math.max(1, selected) : 0,
      message,
    });
    recordedMessage = message;
    pending = false;
  }).observe(importLog, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'data-kind'] });
}
