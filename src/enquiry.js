const form = document.querySelector('#project-enquiry');

if (form) {
  const status = form.querySelector('.form-status');
  const button = form.querySelector('button[type="submit"]');
  const confirmation = document.querySelector('#enquiry-confirmation');
  const fields = Array.from(form.querySelectorAll('input, select, textarea'))
    .filter((field) => field.name !== 'companyWebsite' && field.name !== 'cf-turnstile-response');

  form.noValidate = true;

  const fieldLabel = (field) => field.closest('label')?.querySelector(':scope > span')?.textContent.replace('*', '').trim() || 'This field';

  const validationMessage = (field) => {
    const label = fieldLabel(field);
    if (field.validity.valueMissing) return `${label} is required.`;
    if (field.validity.typeMismatch && field.type === 'email') return 'Enter a complete email address, such as name@example.com.';
    if (field.validity.typeMismatch && field.type === 'url') return 'Enter a complete website address beginning with https://';
    if (field.validity.tooLong) return `${label} is too long.`;
    return `Check ${label.toLowerCase()} and try again.`;
  };

  const clearFieldError = (field) => {
    const label = field.closest('label');
    label?.classList.remove('has-error');
    field.removeAttribute('aria-invalid');
    label?.querySelector('.field-error')?.remove();
    field.removeAttribute('aria-describedby');
  };

  const showFieldError = (field) => {
    clearFieldError(field);
    const label = field.closest('label');
    if (!label) return;

    const error = document.createElement('span');
    const errorId = `error-${field.name}`;
    error.className = 'field-error';
    error.id = errorId;
    error.textContent = validationMessage(field);
    label.classList.add('has-error');
    field.setAttribute('aria-invalid', 'true');
    field.setAttribute('aria-describedby', errorId);
    label.append(error);
  };

  fields.forEach((field) => {
    field.addEventListener('invalid', (event) => {
      event.preventDefault();
      showFieldError(field);
    });

    ['input', 'change'].forEach((eventName) => {
      field.addEventListener(eventName, () => {
        if (field.validity.valid) clearFieldError(field);
      });
    });
  });

  const launchDate = form.elements.namedItem('launch');
  if (launchDate instanceof HTMLInputElement) launchDate.min = new Date().toISOString().slice(0, 10);

  const params = new URLSearchParams(window.location.search);
  const setMatchingOption = (name, requestedValue) => {
    if (!requestedValue) return;
    const field = form.elements.namedItem(name);
    if (!(field instanceof HTMLSelectElement)) return;
    const match = Array.from(field.options).find((option) => option.value === requestedValue || option.textContent.trim() === requestedValue);
    if (!match) return;
    field.value = match.value;
    field.dispatchEvent(new Event('change', { bubbles: true }));
  };

  setMatchingOption('service', params.get('service'));
  setMatchingOption('budget', params.get('budget'));
  if (params.get('source') === 'commission' && status) {
    status.textContent = 'Your commission starting point has been added below. Complete the remaining details when ready.';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invalidFields = fields.filter((field) => !field.validity.valid);
    if (invalidFields.length) {
      invalidFields.forEach(showFieldError);
      invalidFields[0].focus({ preventScroll: true });
      invalidFields[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (status) status.textContent = 'Please check the highlighted details.';
      return;
    }

    const data = new FormData(form);
    const value = (name) => String(data.get(name) || '').trim();
    const turnstileToken = value('cf-turnstile-response');

    if (!turnstileToken) {
      if (status) status.textContent = 'Please complete the security check and try again.';
      document.querySelector('.turnstile-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const payload = {
      name: value('name'),
      email: value('email'),
      business: value('business'),
      service: value('service'),
      budget: value('budget'),
      launch: value('launch'),
      website: value('website'),
      details: value('details'),
      source: value('source'),
      companyWebsite: value('companyWebsite'),
      turnstileToken,
    };

    if (button) button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    if (status) status.textContent = 'Sending your enquiry securely…';

    try {
      const response = await fetch('https://contact.bykira.co.uk/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('submission_failed');

      form.reset();
      fields.forEach(clearFieldError);
      window.turnstile?.reset();
      form.hidden = true;

      if (confirmation) {
        const name = confirmation.querySelector('[data-enquiry-name]');
        if (name) name.textContent = `, ${payload.name.split(/\s+/)[0]}`;
        confirmation.hidden = false;
        confirmation.focus();
      }
    } catch {
      if (status) status.textContent = 'The enquiry could not be sent just now. Your details are still here — please wait a moment and try again.';
      window.turnstile?.reset();
    } finally {
      if (button) button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });

  confirmation?.querySelector('[data-new-enquiry]')?.addEventListener('click', () => {
    confirmation.hidden = true;
    form.hidden = false;
    const firstField = form.elements.namedItem('name');
    if (firstField instanceof HTMLElement) firstField.focus();
    window.turnstile?.reset();
  });
}
