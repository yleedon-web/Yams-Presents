const API_URL = '__APPS_SCRIPT_URL__';

async function fetchGifts() {
  const res = await fetch(API_URL + '?action=list');
  return res.json();
}

async function claimGift(id, name) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({action: 'claim', id, name})
  });
  return res.json();
}

function renderGift(gift) {
  const card = document.createElement('div');
  card.className = 'gift-card ' + (gift.status === 'taken' ? 'taken' : 'available');
  card.dataset.id = gift.id;

  const info = document.createElement('div');
  info.className = 'gift-info';

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
    link.rel = 'noopener';
    info.appendChild(link);
  }

  card.appendChild(info);

  const action = document.createElement('div');
  action.className = 'gift-action';

  if (gift.status === 'taken') {
    const badge = document.createElement('span');
    badge.className = 'taken-badge';
    badge.textContent = 'Taken by ' + gift.claimed_by;
    action.appendChild(badge);
  } else {
    const btn = document.createElement('button');
    btn.textContent = "I'll get this!";
    btn.className = 'claim-btn';
    btn.onclick = () => showClaimForm(card, gift.id);
    action.appendChild(btn);
  }

  card.appendChild(action);
  return card;
}

function showClaimForm(card, id) {
  const action = card.querySelector('.gift-action');
  action.innerHTML = '';

  const form = document.createElement('form');
  form.className = 'claim-form';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Your name';
  input.required = true;
  input.className = 'name-input';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = 'Confirm';
  submit.className = 'confirm-btn';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.textContent = 'Cancel';
  cancel.className = 'cancel-btn';
  cancel.onclick = () => loadGifts();

  form.appendChild(input);
  form.appendChild(submit);
  form.appendChild(cancel);

  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    submit.disabled = true;
    submit.textContent = 'Saving...';
    await claimGift(id, name);
    loadGifts();
  };

  action.appendChild(form);
  input.focus();
}

async function loadGifts() {
  const list = document.getElementById('gift-list');
  list.innerHTML = '<p class="loading">Loading gifts...</p>';
  try {
    const gifts = await fetchGifts();
    list.innerHTML = '';
    if (gifts.length === 0) {
      list.innerHTML = '<p class="empty">No gifts yet!</p>';
      return;
    }
    gifts.forEach(gift => list.appendChild(renderGift(gift)));
  } catch {
    list.innerHTML = '<p class="error">Could not load gifts. Please refresh.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadGifts);
