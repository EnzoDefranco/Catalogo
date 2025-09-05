const API = '/api';

export async function api(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init
  });

  if (!res.ok) {
    // 👇 avisamos a la app que la sesión ya no sirve
    if (res.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    let msg = res.statusText;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
    throw new Error(msg || 'Request failed');
  }

  return res.json();
}
