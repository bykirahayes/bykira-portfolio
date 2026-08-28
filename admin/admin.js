const publicWebsite = window.location.hostname === 'bykira.co.uk' || window.location.hostname === 'www.bykira.co.uk';
const apiBase = publicWebsite ? 'https://bykira-portfolio.safe-bream-3817.chatgpt.site' : '';
const sessionKey = 'kira_admin_session';
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const number = new Intl.NumberFormat('en-GB');

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
const showLogin = (message = '') => { loginView.hidden = false; dashboardView.hidden = true; loginMessage.textContent = message; };
const showDashboard = () => { loginView.hidden = true; dashboardView.hidden = false; };
const empty = '<p class="empty">No visits recorded yet.</p>';

const apiFetch = (path, options = {}) => {
  const token = sessionStorage.getItem(sessionKey);
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${apiBase}${path}`, { ...options, headers, cache: 'no-store', credentials: publicWebsite ? 'omit' : 'same-origin' });
};

const readJson = async (response) => {
  const contentType = response.headers.get('Content-Type') || '';
  const body = await response.text();
  if (!contentType.toLowerCase().includes('application/json') || body.trimStart().startsWith('<')) {
    throw new Error('The admin service is temporarily unavailable. Please refresh and try again.');
  }
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('The dashboard received an invalid response. Please refresh and try again.');
  }
};

const renderRank = (target, rows, labelKey) => {
  target.innerHTML = rows.length ? rows.map((row, index) => `<div class="rank-row"><i>${String(index + 1).padStart(2, '0')}</i><span title="${escapeHtml(row[labelKey])}">${escapeHtml(row[labelKey])}</span><strong>${number.format(row.views)}</strong></div>`).join('') : empty;
};

const renderDashboard = (data) => {
  document.getElementById('metric-7').textContent = number.format(data.summary.last7 || 0);
  document.getElementById('metric-30').textContent = number.format(data.summary.last30 || 0);
  document.getElementById('metric-total').textContent = number.format(data.summary.total || 0);
  const days = new Map(data.daily.map((row) => [row.day, row.views]));
  const values = Array.from({ length: 30 }, (_, offset) => { const date = new Date(); date.setDate(date.getDate() - (29 - offset)); const key = date.toISOString().slice(0, 10); return { key, value: Number(days.get(key) || 0) }; });
  const maximum = Math.max(...values.map((item) => item.value), 1);
  document.getElementById('daily-chart').innerHTML = values.map((item, index) => `<div class="bar" style="--height:${Math.max((item.value / maximum) * 100, item.value ? 3 : 1)}%" title="${item.key}: ${item.value} views">${index % 5 === 0 ? `<span>${item.key.slice(5)}</span>` : ''}</div>`).join('');
  renderRank(document.getElementById('page-list'), data.pages, 'path');
  renderRank(document.getElementById('referrer-list'), data.referrers, 'source');
  const deviceTotal = data.devices.reduce((total, item) => total + Number(item.views), 0) || 1;
  document.getElementById('device-list').innerHTML = data.devices.length ? data.devices.map((item) => `<div class="device-row"><span>${escapeHtml(item.device)}</span><div class="device-track"><i style="--width:${(Number(item.views) / deviceTotal) * 100}%"></i></div><strong>${number.format(item.views)}</strong></div>`).join('') : empty;
  document.getElementById('recent-list').innerHTML = data.recent.length ? data.recent.map((item) => `<div class="activity-row"><strong>${escapeHtml(item.path)}</strong><span>${escapeHtml(item.device)}</span><span>${escapeHtml(item.referrer_origin || 'Direct / unknown')}</span><time>${new Date(`${item.created_at}Z`).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</time></div>`).join('') : empty;
  document.getElementById('updated-at').textContent = `Updated ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
};

const loadAnalytics = async () => {
  dashboardView.classList.add('loading');
  try {
    const response = await apiFetch('/api/analytics');
    if (response.status === 401) { sessionStorage.removeItem(sessionKey); return showLogin('Your session has ended. Please sign in again.'); }
    if (!response.ok) throw new Error('Unable to load analytics.');
    renderDashboard(await readJson(response));
    showDashboard();
  } catch (error) {
    showLogin(error.message);
  } finally {
    dashboardView.classList.remove('loading');
  }
};

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = loginForm.querySelector('button');
  button.disabled = true;
  loginMessage.textContent = 'Checking your details…';
  const form = new FormData(loginForm);
  try {
    const response = await apiFetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
    const result = await readJson(response);
    if (!response.ok) throw new Error(result.error || 'Unable to sign in.');
    if (result.token) sessionStorage.setItem(sessionKey, result.token);
    loginForm.reset();
    await loadAnalytics();
  } catch (error) {
    loginMessage.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

document.getElementById('refresh-button').addEventListener('click', loadAnalytics);
document.getElementById('logout-button').addEventListener('click', async () => { await apiFetch('/api/logout', { method: 'POST' }); sessionStorage.removeItem(sessionKey); showLogin('You have signed out securely.'); });

apiFetch('/api/me')
  .then(readJson)
  .then((data) => data.authenticated ? loadAnalytics() : showLogin())
  .catch((error) => {
    if (!error.message.includes('Redirecting')) showLogin('Unable to verify your session. Please refresh and try again.');
  });
