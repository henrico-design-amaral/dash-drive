import { clearImportHistory, formatImportSource, formatImportStatus, listImportHistory } from '../lib/import-history';

const moneyCount = new Intl.NumberFormat('pt-BR');
const dateTime = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

function escapeHtml(input: unknown) {
  return String(input ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}

function render() {
  const rows = document.querySelector<HTMLElement>('#import-history-rows');
  const summary = document.querySelector<HTMLElement>('#import-history-summary');
  if (!rows || !summary) return;
  const entries = listImportHistory();
  summary.textContent = entries.length ? `${entries.length} importação(ões) registrada(s) neste navegador.` : 'Nenhuma importação registrada neste navegador.';
  rows.innerHTML = entries.length ? entries.map(entry => `
    <tr>
      <td>${dateTime.format(new Date(entry.createdAt))}</td>
      <td>${escapeHtml(formatImportSource(entry.source))}</td>
      <td>${escapeHtml(entry.fileName || '—')}</td>
      <td><span class="import-status import-status--${entry.status}">${formatImportStatus(entry.status)}</span></td>
      <td>${moneyCount.format(entry.importedCount)}</td>
      <td>${moneyCount.format(entry.skippedCount)}</td>
      <td>${moneyCount.format(entry.errorCount)}</td>
      <td>${escapeHtml(entry.message)}</td>
    </tr>`).join('') : '<tr><td colspan="8" class="muted">O histórico aparecerá aqui após a próxima importação.</td></tr>';
}

document.querySelector('#clear-import-history')?.addEventListener('click', () => {
  if (confirm('Limpar apenas o histórico local de importações? Os fechamentos já salvos não serão alterados.')) clearImportHistory();
});
window.addEventListener('motoristaops:import-history-changed', render);
render();
