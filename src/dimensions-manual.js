export function renderManualDimensionsForm(container, { onSubmit }) {
  container.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'manual-dimensions-form';

  function makeField(labelText, id) {
    const wrapper = document.createElement('div');
    wrapper.className = 'field';
    const label = document.createElement('label');
    label.textContent = labelText;
    label.htmlFor = id;
    const input = document.createElement('input');
    input.type = 'number';
    input.id = id;
    input.inputMode = 'decimal';
    input.min = '0.1';
    input.step = '0.1';
    input.required = true;
    wrapper.append(label, input);
    return { wrapper, input };
  }

  const lField = makeField('Length (cm)', 'dim-l');
  const wField = makeField('Width (cm)', 'dim-w');
  const hField = makeField('Height (cm)', 'dim-h');

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = 'Next';
  submitBtn.className = 'primary-btn';

  form.append(lField.wrapper, wField.wrapper, hField.wrapper, submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const l = parseFloat(lField.input.value);
    const w = parseFloat(wField.input.value);
    const h = parseFloat(hField.input.value);
    if (l > 0 && w > 0 && h > 0) {
      onSubmit({ l, w, h });
    }
  });

  container.appendChild(form);
}
