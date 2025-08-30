// src/components/FilterBar.tsx
import { useEffect, useMemo, useState } from 'react';

type Props = { onChange?: () => void };
const API = 'http://localhost/db.php';

export default function FilterBar({ onChange }: Props) {
  // seleccionados (desde la URL)
  const [proveedor, setProveedor] = useState<string>(() => new URLSearchParams(location.search).get('proveedor') || '');
  const [division,  setDivision]  = useState<string>(() => new URLSearchParams(location.search).get('division')  || '');
  const [linea,     setLinea]     = useState<string>(() => new URLSearchParams(location.search).get('linea')     || '');
  const [rubro,     setRubro]     = useState<string>(() => new URLSearchParams(location.search).get('rubro')     || '');

  // opciones
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [divisiones,  setDivisiones]  = useState<string[]>([]);
  const [lineas,      setLineas]      = useState<string[]>([]);
  const [rubros,      setRubros]      = useState<string[]>([]);

  const esc = (s: string) => encodeURIComponent(s);

  /* ====== combos ====== */

  // Proveedores (se puede filtrar por división; si d cambia, refrescamos)
  useEffect(() => {
    const url = division
      ? `${API}?action=proveedores&division=${esc(division)}`
      : `${API}?action=proveedores`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        setProveedores(list);
        if (proveedor && !list.includes(proveedor)) {
          setProveedor('');
          applyToUrl('', division, linea, rubro);
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division]);

  // Divisiones: si hay proveedor, filtra; si no, trae todas
  useEffect(() => {
    const url = proveedor
      ? `${API}?action=divisiones&proveedor=${esc(proveedor)}`
      : `${API}?action=divisiones`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        setDivisiones(list);
        // si la división actual ya no existe, limpiar dependientes
        if (division && !list.includes(division)) {
          setDivision('');
          setLinea('');
          setRubro('');
          applyToUrl(proveedor, '', '', '');
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor]);

  // Líneas: dependen de división (proveedor opcional)
  useEffect(() => {
    if (!division) { setLineas([]); setLinea(''); return; }
    const url = `${API}?action=lineas&division=${esc(division)}${proveedor ? `&proveedor=${esc(proveedor)}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        setLineas(list);
        if (linea && !list.includes(linea)) {
          setLinea('');
          setRubro('');
          applyToUrl(proveedor, division, '', '');
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, proveedor]);

  // Rubros: dependen de división + línea (proveedor opcional)
  useEffect(() => {
    if (!division || !linea) { setRubros([]); setRubro(''); return; }
    const url = `${API}?action=rubros&division=${esc(division)}&linea=${esc(linea)}${proveedor ? `&proveedor=${esc(proveedor)}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        setRubros(list);
        if (rubro && !list.includes(rubro)) {
          setRubro('');
          applyToUrl(proveedor, division, linea, '');
        }
      })
      .catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, linea, proveedor]);

  /* ====== URL + notificación ====== */
  const applyToUrl = useMemo(() => (p: string, d: string, l: string, r: string) => {
    const sp = new URLSearchParams(location.search);
    p ? sp.set('proveedor', p) : sp.delete('proveedor');
    d ? sp.set('division',  d) : sp.delete('division');
    l ? sp.set('linea',     l) : sp.delete('linea');
    r ? sp.set('rubro',     r) : sp.delete('rubro');
    history.pushState({}, '', `${location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new Event('filters:change'));
    onChange?.();
  }, [onChange]);

  const clearAll = () => {
    setProveedor('');
    setDivision('');
    setLinea('');
    setRubro('');
    applyToUrl('', '', '', '');
  };

  /* ====== UI ====== */
  return (
    <div className="w-full">
  <div className="mx-auto max-w-[1200px] flex flex-wrap items-center justify-center gap-2 md:gap-3">
    
    {/* Select base style */}
    {/** TIP: podés sacar esta clase a una constante si querés reutilizar */}
    <select
      className="border rounded-full px-2 py-1 text-sm min-w-[140px] w-full sm:w-auto"
      value={proveedor}
      onChange={(e) => {
        const p = e.target.value;
        setProveedor(p);
        setLinea('');
        setRubro('');
        applyToUrl(p, division, '', '');
      }}
    >
      <option value="">Todos los proveedores</option>
      {proveedores.map((p) => <option key={p} value={p}>{p}</option>)}
    </select>

    <select
      className="border rounded-full px-2 py-1 text-sm min-w-[140px] w-full sm:w-auto"
      value={division}
      onChange={(e) => {
        const d = e.target.value;
        setDivision(d);
        setLinea('');
        setRubro('');
        applyToUrl(proveedor, d, '', '');
      }}
    >
      <option value="">Seleccioná división</option>
      {divisiones.map((d) => <option key={d} value={d}>{d}</option>)}
    </select>

    <select
      className="border rounded-full px-2 py-1 text-sm min-w-[140px] w-full sm:w-auto"
      value={linea}
      onChange={(e) => {
        const l = e.target.value;
        setLinea(l);
        setRubro('');
        applyToUrl(proveedor, division, l, '');
      }}
      disabled={!division}
    >
      <option value="">{division ? 'Seleccioná línea' : 'Elegí primero una división'}</option>
      {lineas.map((l) => <option key={l} value={l}>{l}</option>)}
    </select>

    <select
      className="border rounded-full px-2 py-1 text-sm min-w-[140px] w-full sm:w-auto"
      value={rubro}
      onChange={(e) => {
        const r = e.target.value;
        setRubro(r);
        applyToUrl(proveedor, division, linea, r);
      }}
      disabled={!division || !linea}
    >
      <option value="">{(division && linea) ? 'Seleccioná rubro' : 'Elegí primero una línea'}</option>
      {rubros.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>

    {/* Botón limpiar */}
    <button
      type="button"
      onClick={clearAll}
      className="shrink-0 inline-flex items-center gap-1 px-2 py-1 border rounded-full text-sm text-gray-700 hover:bg-gray-100 w-full sm:w-auto justify-center"
      title="Borrar filtros"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      </svg>
      Limpiar
    </button>
  </div>
</div>

  )
}
