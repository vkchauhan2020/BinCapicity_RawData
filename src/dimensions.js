import { isArSupported, startArMeasurement, TAP_PROMPTS } from './dimensions-ar.js';
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

  arBtn.addEventListener('click', async () => {
    container.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'ar-overlay';
    overlay.innerHTML = `
      <div class="ar-crosshair"></div>
      <div class="ar-panel">
        <p class="ar-prompt-text"></p>
        <button type="button" class="ar-confirm-btn primary-btn" disabled>Confirm Point</button>
        <button type="button" class="ar-cancel-btn secondary-btn">Cancel</button>
      </div>
    `;
    container.appendChild(overlay);

    const crosshair = overlay.querySelector('.ar-crosshair');
    const promptText = overlay.querySelector('.ar-prompt-text');
    const confirmBtn = overlay.querySelector('.ar-confirm-btn');
    const cancelBtn = overlay.querySelector('.ar-cancel-btn');

    const controller = await startArMeasurement({
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
      onStepChange: (stepIndex) => {
        promptText.textContent = TAP_PROMPTS[stepIndex] || '';
      },
      onFrameUpdate: ({ hasValidHit }) => {
        crosshair.classList.toggle('hit', hasValidHit);
        confirmBtn.disabled = !hasValidHit;
      },
    });

    if (!controller) return;

    confirmBtn.addEventListener('click', () => controller.confirmPoint());
    cancelBtn.addEventListener('click', () => controller.cancel());
  });
}
