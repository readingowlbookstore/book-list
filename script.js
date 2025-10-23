let allRows = [];

async function loadCSV() {
  try {
    const response = await fetch('book-list.csv');
    if (!response.ok) throw new Error('Failed to load CSV');
    const text = await response.text();

    // Use PapaParse to handle commas and quotes correctly
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    allRows = [Object.keys(parsed.data[0]), ...parsed.data.map(Object.values)];
    
    renderTable(allRows);
    document.getElementById('status').textContent = `Loaded ${allRows.length - 1} books`;
  } catch (err) {
    document.getElementById('status').textContent = 'Error loading CSV: ' + err.message;
  }
}

function renderTable(rows) {
  const table = document.getElementById('csvTable');
  table.innerHTML = '';

  const headers = rows[0];
  const mainCols = ['Title', 'Author', 'Price_PHP', 'Condition'];

  // Header
  const headerRow = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    th.classList.add('bg-primary', 'text-white');
    if (!mainCols.includes(h)) th.classList.add('d-none', 'd-md-table-cell');
    headerRow.appendChild(th);
  });

  const thMore = document.createElement('th');
  thMore.classList.add('d-md-none');
  headerRow.appendChild(thMore);
  table.appendChild(headerRow);

  // Data rows
  rows.slice(1).forEach((r, rowIndex) => {
    const tr = document.createElement('tr');

    r.forEach((c, i) => {
      const td = document.createElement('td');
      const colName = headers[i];
      td.textContent = colName === 'Price_PHP' ? `₱${c}` : c;
      if (!mainCols.includes(colName)) td.classList.add('d-none', 'd-md-table-cell');
      tr.appendChild(td);
    });

    const moreTd = document.createElement('td');
    moreTd.classList.add('d-md-none');
    const btn = document.createElement('span');
    btn.classList.add('more-btn');
    btn.textContent = 'More';
    btn.onclick = () => toggleDetails(rowIndex, tr, r, headers, btn);
    moreTd.appendChild(btn);
    tr.appendChild(moreTd);

    table.appendChild(tr);
  });
}

function toggleDetails(rowIndex, rowEl, rowData, headers, btn) {
  const existing = rowEl.nextElementSibling;
  if (existing && existing.classList.contains('details-row')) {
    existing.remove();
    btn.textContent = 'More';
    return;
  }

  document.querySelectorAll('.details-row').forEach(el => el.remove());
  document.querySelectorAll('.more-btn').forEach(b => (b.textContent = 'More'));

  const detailsRow = document.createElement('tr');
  detailsRow.classList.add('details-row', 'd-md-none');
  const detailsTd = document.createElement('td');
  detailsTd.colSpan = headers.length + 1;

  const detailsCard = document.createElement('div');
  detailsCard.classList.add('details-card');

  const grid = document.createElement('div');
  grid.classList.add('details-grid');

  headers.forEach((h, i) => {
    if (!['Title', 'Author', 'Price_PHP', 'Condition'].includes(h)) {
      const label = document.createElement('strong');
      label.textContent = `${h}:`;

      let value;
      if (h.toLowerCase() === 'synopsis') {
        value = document.createElement('div');
        value.style.whiteSpace = 'pre-wrap';
        value.style.wordBreak = 'break-word';
        value.style.marginTop = '4px';
        value.textContent = rowData[i] || '—';
      } else {
        value = document.createElement('span');
        value.textContent = rowData[i] || '—';
      }

      const container = document.createElement('div');
      container.appendChild(label);
      container.appendChild(value);
      grid.appendChild(container);
    }
  });

  detailsCard.appendChild(grid);
  detailsTd.appendChild(detailsCard);
  detailsRow.appendChild(detailsTd);
  rowEl.insertAdjacentElement('afterend', detailsRow);
  btn.textContent = 'Hide';
}

document.getElementById('searchInput').addEventListener('input', e => {
  const query = e.target.value.toLowerCase();
  if (!allRows.length) return;

  const filtered = [allRows[0], ...allRows.slice(1).filter(r =>
    r.some(cell => cell.toLowerCase().includes(query))
  )];

  renderTable(filtered);
  document.getElementById('status').textContent =
    `Showing ${filtered.length - 1} of ${allRows.length - 1} books`;
});

loadCSV();
