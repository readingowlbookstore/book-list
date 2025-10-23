let allRows = [];

async function loadCSV() {
  try {
    const response = await fetch('book-list.csv');
    if (!response.ok) throw new Error('Failed to load CSV');
    const text = await response.text();
    const rows = text.trim().split(/\r?\n/).map(line => line.split(','));
    allRows = rows;
    renderTable(rows);
    document.getElementById('status').textContent = `Loaded ${rows.length - 1} books`;
  } catch (err) {
    document.getElementById('status').textContent = 'Error loading CSV: ' + err.message;
  }
}

function renderTable(rows) {
  const table = document.getElementById('csvTable');
  table.innerHTML = '';

  // Define column visibility per device
  const visibleColumns = {
    0: '', // Title (always visible)
    1: '', // Author (always visible)
    2: '', // Price_PHP (always visible)
    3: 'd-none d-md-table-cell', // Genre (hide on mobile)
    4: 'd-none d-md-table-cell', // Stock (hide on mobile)
    5: 'd-none d-md-table-cell', // Condition (hide on mobile)
    6: 'd-none d-md-table-cell'  // ISBN (hide on mobile)
  };

  // Header
  const headerRow = document.createElement('tr');
  rows[0].forEach((h, i) => {
    const th = document.createElement('th');
    th.textContent = h;
    th.classList.add('bg-primary', 'text-white');
    if (visibleColumns[i]) th.classList.add(...visibleColumns[i].split(' '));
    headerRow.appendChild(th);
  });
  table.appendChild(headerRow);

  // Data rows
  rows.slice(1).forEach(r => {
    const tr = document.createElement('tr');
    r.forEach((c, i) => {
      const td = document.createElement('td');

      // Format specific columns
      if (rows[0][i] === 'Price_PHP') {
        td.textContent = `₱${c}`;
      } else if (rows[0][i] === 'Stock') {
        const stockIndex = rows[0].indexOf('Stock');
        const stockValue = Number(r[stockIndex]) || 0;
        if (stockValue <= 0) {
          td.innerHTML = '<span class="text-danger fw-semibold">Out of Stock 🔴</span>';
        } else if (stockValue < 10) {
          td.innerHTML = '<span class="text-warning fw-semibold">Low Stock 🟡</span>';
        } else {
          td.innerHTML = '<span class="text-success fw-semibold">In Stock 🟢</span>';
        }
      } else {
        td.textContent = c;
      }

      if (visibleColumns[i]) td.classList.add(...visibleColumns[i].split(' '));
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
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
