import { isArSupported, startArMeasurement } from './dimensions-ar.js';
import { renderManualDimensionsForm } from './dimensions-manual.js';

export async function startDimensionCapture(container, { onComplete }) {
  container.innerHTML = '';

  const arSupported = await isArSupported();

  if (!arSupported) {
    renderManualDimensionsForm(container, { onSubmit: onComplete });
    return;
  }

  const chooser = document.createElement('div');
  chooser.className = 'dimension-chooser';

  const arBtn = document.createElement('button');
  arBtn.className = 'primary-btn';
  arBtn.textContent = 'Measure with AR';

  const manualBtn = document.createElement('button');
  manualBtn.className = 'secondary-btn';
  manualBtn.textContent = 'Enter manually';

  chooser.append(arBtn, manualBtn);
  container.appendChild(chooser);

  manualBtn.addEventListener('click', () => {
    renderManualDimensionsForm(container, { onSubmit: onComplete });
  });

  arBtn.addEventListener('click', () => {
    container.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'ar-overlay';
    overlay.innerHTML = `
      <p class="ar-prompt-text"></p>
      <button type="button" class="ar-cancel-btn secondary-btn">Cancel</button>
    `;
    container.appendChild(overlay);

    startArMeasurement({
      overlayElement: overlay,
      onMeasured: (l, w, h) => {
        onComplete({ l, w, h });
      },
      onCancel: () => {
        renderManualDimensionsForm(container, { onSubmit: onComplete });
      },
      onUnsupported: () => {
        renderManualDimensionsForm(container, { onSubmit: onComplete });
      },
    });
  });
}
