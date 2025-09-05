// src/lib/jfetch.ts
export async function jfetch<T = any>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: 'include' }); // manda la cookie de sesión
  if (res.status === 401) {
    window.dispatchEvent(new Event('auth:unauthorized'));   // tu AuthContext hará logout
    throw new Error('UNAUTHORIZED');
  }
  if (!res.ok) throw new Error(res.statusText || 'Request failed');
  return res.json() as Promise<T>;
}
