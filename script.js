
const statusMap = { 'HC': 'Has creases', 'HF': 'Has foxing', };
const conditionMap = { 'P': 'Preloved', 'N': 'New' };
const formatMap = { 'PB': 'Paperback', 'HB': 'Hardbound' };

let allRows = [];

async function loadCSV() {
  try {
    const response = await fetch('book-list.csv');
    if (!response.ok) throw new Error('Failed to load CSV');
    const text = await response.text();

    // Use PapaParse to handle quotes & commas correctly
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
      let value = c; // Declare value

      // Decode codes for table cells
      if (colName === 'Status') {
        value = c.split(',').map(s => statusMap[s.trim()] || s.trim()).join(', ');
      }
      if (colName === 'Condition') {
        value = c.split(',').map(s => conditionMap[s.trim()] || s.trim()).join(', ');
      }
      if (colName === 'Format') {
        value = c.split(',').map(s => formatMap[s.trim()] || s.trim()).join(', ');
      }

      td.textContent = colName === 'Price_PHP' ? `₱${value}` : value;
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

      let value = rowData[i] || '—';
      if (h === 'Status') value = value.split(',').map(s => statusMap[s.trim()] || s.trim()).join(', ');
      if (h === 'Condition') value = value.split(',').map(s => conditionMap[s.trim()] || s.trim()).join(', ');
      if (h === 'Format') value = value.split(',').map(s => formatMap[s.trim()] || s.trim()).join(', ');

      let valueEl;
      if (h.toLowerCase() === 'synopsis') {
        valueEl = document.createElement('div');
        valueEl.style.whiteSpace = 'pre-wrap';
        valueEl.style.wordBreak = 'break-word';
        valueEl.style.marginTop = '4px';
        valueEl.textContent = value;
      } else {
        valueEl = document.createElement('span');
        valueEl.textContent = value;
      }

      const container = document.createElement('div');
      container.appendChild(label);
      container.appendChild(valueEl);
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
