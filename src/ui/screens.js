import { startBarcodeScan } from '../barcode.js';
import { startDimensionCapture } from '../dimensions.js';
import { renderEntryTable } from './entryTable.js';

export function renderScanScreen(root, { onScanned }) {
  root.innerHTML = '';
  const heading = document.createElement('h1');
  heading.textContent = 'Scan Product Barcode';

  const status = document.createElement('p');
  status.className = 'status-text';

  const startBtn = document.createElement('button');
  startBtn.className = 'primary-btn';
  startBtn.textContent = 'Start Scanning';

  const readerContainer = document.createElement('div');

  startBtn.addEventListener('click', () => {
    status.textContent = '';
    startBtn.disabled = true;
    startBarcodeScan(
      readerContainer,
      (decodedText) => {
        startBtn.disabled = false;
        onScanned(decodedText);
      },
      (errorMessage) => {
        startBtn.disabled = false;
        status.textContent = errorMessage;
      }
    );
  });

  root.append(heading, status, startBtn, readerContainer);
}

export function renderDimensionsScreen(root, { onMeasured }) {
  root.innerHTML = '';
  const heading = document.createElement('h1');
  heading.textContent = 'Measure Box Dimensions';

  const captureContainer = document.createElement('div');

  root.append(heading, captureContainer);

  startDimensionCapture(captureContainer, { onComplete: onMeasured });
}

export function renderWeightQtyScreen(root, { onSubmit }) {
  root.innerHTML = '';
  const heading = document.createElement('h1');
  heading.textContent = 'Weight & Quantity';

  const form = document.createElement('form');

  const weightWrapper = document.createElement('div');
  weightWrapper.className = 'field';
  weightWrapper.innerHTML = '<label for="weight-kg">Approx. weight per box (kg)</label>';
  const weightInput = document.createElement('input');
  weightInput.type = 'number';
  weightInput.id = 'weight-kg';
  weightInput.inputMode = 'decimal';
  weightInput.min = '0.01';
  weightInput.step = '0.01';
  weightInput.required = true;
  weightWrapper.appendChild(weightInput);

  const qtyWrapper = document.createElement('div');
  qtyWrapper.className = 'field';
  qtyWrapper.innerHTML = '<label for="ea-per-box">Quantity per box (EA/Box)</label>';
  const qtyInput = document.createElement('input');
  qtyInput.type = 'number';
  qtyInput.id = 'ea-per-box';
  qtyInput.inputMode = 'numeric';
  qtyInput.min = '1';
  qtyInput.step = '1';
  qtyInput.required = true;
  qtyWrapper.appendChild(qtyInput);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'primary-btn';
  submitBtn.textContent = 'Add Box';

  form.append(weightWrapper, qtyWrapper, submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const weightKg = parseFloat(weightInput.value);
    const eaPerBox = parseInt(qtyInput.value, 10);
    if (weightKg > 0 && eaPerBox > 0) {
      onSubmit({ weightKg, eaPerBox });
    }
  });

  root.append(heading, form);
}

export function renderListScreen(root, { onAddAnother }) {
  root.innerHTML = '';
  const heading = document.createElement('h1');
  heading.textContent = 'Box Capacity Data';

  const addBtn = document.createElement('button');
  addBtn.className = 'secondary-btn';
  addBtn.textContent = 'Add another box';
  addBtn.addEventListener('click', onAddAnother);

  const tableContainer = document.createElement('div');

  root.append(heading, addBtn, tableContainer);

  renderEntryTable(tableContainer);
}
