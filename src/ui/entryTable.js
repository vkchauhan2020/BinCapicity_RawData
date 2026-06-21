import { state, deleteEntry } from '../state.js';
import { entriesToCsv, downloadCsv } from '../csv.js';

export function renderEntryTable(container) {
  function refresh() {
    container.innerHTML = '';

    const heading = document.createElement('h2');
    heading.textContent = `Scanned Boxes (${state.entries.length})`;
    container.appendChild(heading);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>Article</th><th>L</th><th>W</th><th>H</th><th>Weight (kg)</th><th>EA/Box</th><th></th>
      </tr>
    `;
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    state.entries.forEach((entry) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${entry.article}</td>
        <td>${entry.l}</td>
        <td>${entry.w}</td>
        <td>${entry.h}</td>
        <td>${entry.weightKg}</td>
        <td>${entry.eaPerBox}</td>
      `;
      const deleteCell = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'delete-btn';
      deleteBtn.addEventListener('click', () => {
        deleteEntry(entry.id);
        refresh();
      });
      deleteCell.appendChild(deleteBtn);
      tr.appendChild(deleteCell);
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);

    const exportBtn = document.createElement('button');
    exportBtn.className = 'primary-btn';
    exportBtn.textContent = 'Export CSV';
    exportBtn.disabled = state.entries.length === 0;
    exportBtn.addEventListener('click', () => {
      downloadCsv('bin-capacity-export.csv', entriesToCsv(state.entries));
    });
    container.appendChild(exportBtn);
  }

  refresh();
  return { refresh };
}
