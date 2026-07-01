const ADMIN_PASSWORD = '__ADMIN_PASSWORD__';
const API_URL = '__APPS_SCRIPT_URL__';

async function apiPost(body) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

async function loadAdminGifts() {
  const list = document.getElementById('admin-gift-list');
  list.innerHTML = '<p class="loading">Loading...</p>';
  try {
    const res = await fetch(API_URL + '?action=list');
    const gifts = await res.json();
    if (!Array.isArray(gifts)) throw new Error('Bad response');
    list.innerHTML = '';
    if (gifts.length === 0) {
      list.innerHTML = '<p class="empty">No gifts yet.</p>';
      return;
    }
    gifts.forEach(gift => list.appendChild(renderAdminGift(gift)));
  } catch {
    list.innerHTML = '<p class="error">Could not load gifts. Please refresh.</p>';
  }
}

function renderAdminGift(gift) {
  const card = document.createElement('div');
  card.className = 'admin-gift-card' + (gift.status === 'taken' ? ' taken' : '');

  const info = document.createElement('div');
  info.className = 'admin-gift-info';

  const nameEl = document.createElement('h3');
  nameEl.textContent = gift.name;
  info.appendChild(nameEl);

  if (gift.description) {
    const desc = document.createElement('p');
    desc.textContent = gift.description;
    info.appendChild(desc);
  }

  if (gift.link) {
    const link = document.createElement('a');
    link.href = gift.link;
    link.textContent = 'View item';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    info.appendChild(link);
  }

  const statusEl = document.createElement('p');
  statusEl.className = 'status';
  statusEl.textContent = gift.status === 'taken'
    ? 'Taken by ' + (gift.claimed_by || 'someone')
    : 'Available';
  info.appendChild(statusEl);

  card.appendChild(info);

  const actions = document.createElement('div');
  actions.className = 'admin-gift-actions';

  const errorEl = document.createElement('p');
  errorEl.className = 'card-error';
  errorEl.style.display = 'none';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = async () => {
    deleteBtn.disabled = true;
    deleteBtn.textContent = '...';
    try {
      const result = await apiPost({action: 'delete', id: gift.id});
      if (result.error) throw new Error(result.error);
      await loadAdminGifts();
    } catch (e) {
      errorEl.textContent = e.message || 'Delete failed.';
      errorEl.style.display = '';
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete';
    }
  };
  actions.appendChild(deleteBtn);

  if (gift.status === 'taken') {
    const unclaimBtn = document.createElement('button');
    unclaimBtn.textContent = 'Unclaim';
    unclaimBtn.className = 'unclaim-btn';
    unclaimBtn.onclick = async () => {
      unclaimBtn.disabled = true;
      unclaimBtn.textContent = '...';
      try {
        const result = await apiPost({action: 'unclaim', id: gift.id});
        if (result.error) throw new Error(result.error);
        await loadAdminGifts();
      } catch (e) {
        errorEl.textContent = e.message || 'Unclaim failed.';
        errorEl.style.display = '';
        unclaimBtn.disabled = false;
        unclaimBtn.textContent = 'Unclaim';
      }
    };
    actions.appendChild(unclaimBtn);
  }

  const wrapper = document.createElement('div');
  wrapper.appendChild(actions);
  wrapper.appendChild(errorEl);
  card.appendChild(wrapper);

  return card;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const loginSection = document.getElementById('login-section');
  const adminSection = document.getElementById('admin-section');

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const entered = document.getElementById('password-input').value;
    if (entered === ADMIN_PASSWORD) {
      loginSection.style.display = 'none';
      adminSection.style.display = '';
      loadAdminGifts();
    } else {
      loginError.style.display = '';
    }
  });

  const addForm = document.getElementById('add-gift-form');
  const addError = document.getElementById('add-error');

  addForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('new-name').value.trim();
    const description = document.getElementById('new-description').value.trim();
    const link = document.getElementById('new-link').value.trim();
    if (!name) return;
    addError.style.display = 'none';
    const submitBtn = addForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    try {
      const result = await apiPost({action: 'add', name, description, link});
      if (result.error) throw new Error(result.error);
      addForm.reset();
      loadAdminGifts();
    } catch (err) {
      addError.textContent = err.message || 'Failed to add gift.';
      addError.style.display = '';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Add Gift';
    }
  });
});
