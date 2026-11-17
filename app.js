const choices = document.querySelectorAll('input[name="Présence"]');
const group = document.getElementById('group');
const count = document.getElementById('count');
const total = document.getElementById('total');
function update() {
  const accompanied = document.querySelector('input[name="Présence"]:checked')?.value === 'Accompagné(e)';
  group.hidden = !accompanied;
  count.disabled = !accompanied;
  count.required = accompanied;
  total.value = accompanied ? count.value : '1';
}
choices.forEach(choice => choice.addEventListener('change', update));
count.addEventListener('input', update);
const form = document.getElementById('rsvp');
const firstName = document.getElementById('first-name');
firstName.addEventListener('input', () => firstName.setCustomValidity(''));
const button = form.querySelector('button[type="submit"]');
const feedback = document.getElementById('feedback');
let sending = false;
let sent = false;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (sending || sent) return;
  const givenName = firstName.value.trim();
  firstName.setCustomValidity(givenName ? '' : 'Indiquez votre prénom.');
  if (!form.reportValidity()) return;
  update();
  sending = true;
  button.disabled = true;
  button.textContent = 'Envoi en cours…';
  form.setAttribute('aria-busy', 'true');
  feedback.hidden = true;
  const number = Number(total.value);
  const alone = number === 1;
  const payload = {
    'Prénom': givenName,
    'Réponse': alone ? 'Vient seul(e)' : 'Vient accompagné(e)',
    'Nombre total de personnes (répondant compris)': number,
    'Nombre d’accompagnants': number - 1,
    '_subject': `MAGALAÏ — ${alone ? 'Vient seul(e) · 1 personne' : `Vient accompagné(e) · ${number} personnes au total`}`,
    '_template': 'table',
    '_honey': form.elements.namedItem('_honey').value
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const endpoint = form.action.replace('formsubmit.co/', 'formsubmit.co/ajax/');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    const result = await response.json();
    if (/activat|confirm your email|check your email/i.test(result.message || '')) {
      throw new Error('activation');
    }
    if (!response.ok || !(result.success === true || result.success === 'true')) {
      throw new Error('rejected');
    }
    sent = true;
    firstName.closest('.first-name').hidden = true;
    form.querySelector('fieldset').hidden = true;
    group.hidden = true;
    button.hidden = true;
    form.querySelector('.note').hidden = true;
    feedback.className = 'feedback success-message';
    feedback.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = 'Merci d’avoir répondu au sondage !';
    const message = document.createElement('p');
    message.textContent = 'Votre réponse a bien été envoyée.';
    const recap = document.createElement('p');
    recap.className = 'recap';
    recap.textContent = alone ? 'Vous venez seul(e) · 1 personne.' : `Vous venez accompagné(e) · ${number} personnes au total, vous compris(e).`;
    const closing = document.createElement('p');
    closing.textContent = 'À bientôt le 11 décembre ! Vous pouvez fermer cette page.';
    feedback.append(title, message, recap, closing);
  } catch (error) {
    feedback.className = 'feedback error-message';
    feedback.textContent = error.message === 'activation'
      ? 'Le sondage attend encore son activation par l’organisatrice. Votre réponse n’est pas confirmée. Merci de réessayer plus tard.'
      : 'Nous ne pouvons pas confirmer l’envoi de votre réponse. Vérifiez votre connexion puis réessayez. Si le problème persiste, contactez l’organisatrice pour éviter un doublon.';
    button.disabled = false;
    button.textContent = 'Réessayer l’envoi';
  } finally {
    clearTimeout(timeout);
    sending = false;
    form.removeAttribute('aria-busy');
    feedback.hidden = false;
    feedback.focus();
    feedback.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
});
window.addEventListener('pageshow', update);
