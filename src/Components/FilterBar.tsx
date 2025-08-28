// src/components/FilterBar.tsx
import { useEffect, useMemo, useState } from 'react';

type Props = {
  onChange?: () => void;
};

const API = 'http://localhost/db.php';

export default function FilterBar({ onChange }: Props) {
  // estados seleccionados
  const [proveedor, setProveedor] = useState<string>(() => new URLSearchParams(location.search).get('proveedor') || '');
  const [division, setDivision]   = useState<string>(() => new URLSearchParams(location.search).get('division') || '');
  const [linea, setLinea]         = useState<string>(() => new URLSearchParams(location.search).get('linea') || '');
  const [rubro, setRubro]         = useState<string>(() => new URLSearchParams(location.search).get('rubro') || '');

  // opciones
  const [proveedores, setProveedores] = useState<string[]>([]);
  const [divisiones, setDivisiones]   = useState<string[]>([]);
  const [lineas, setLineas]           = useState<string[]>([]);
  const [rubros, setRubros]           = useState<string[]>([]);

  // cargar proveedores al montar
  useEffect(() => {
    fetch(`${API}?action=proveedores`)
      .then(r => r.json())
      .then(setProveedores)
      .catch(console.error);
  }, []);

  // cargar divisiones cuando cambia proveedor
  useEffect(() => {
    if (!proveedor) {
      setDivisiones([]);
      setDivision('');
      return;
    }
    fetch(`${API}?action=divisiones&proveedor=${encodeURIComponent(proveedor)}`)
      .then(r => r.json())
      .then(setDivisiones)
      .catch(console.error);
  }, [proveedor]);

  // cargar líneas cuando cambia división
  useEffect(() => {
    if (!division) {
      setLineas([]);
      setLinea('');
      return;
    }
    fetch(`${API}?action=lineas&division=${encodeURIComponent(division)}&proveedor=${encodeURIComponent(proveedor)}`)
      .then(r => r.json())
      .then(setLineas)
      .catch(console.error);
  }, [division, proveedor]);

  // cargar rubros cuando cambia división o línea
  useEffect(() => {
    if (!division || !linea) {
      setRubros([]);
      setRubro('');
      return;
    }
    const url = `${API}?action=rubros&division=${encodeURIComponent(division)}&linea=${encodeURIComponent(linea)}&proveedor=${encodeURIComponent(proveedor)}`;
    fetch(url)
      .then(r => r.json())
      .then(setRubros)
      .catch(console.error);
  }, [division, linea, proveedor]);

  // sincronizar con querystring y notificar
  const applyToUrl = useMemo(() => (p: string, d: string, l: string, r: string) => {
    const sp = new URLSearchParams(location.search);
    p ? sp.set('proveedor', p) : sp.delete('proveedor');
    d ? sp.set('division', d)  : sp.delete('division');
    l ? sp.set('linea', l)     : sp.delete('linea');
    r ? sp.set('rubro', r)     : sp.delete('rubro');
    history.pushState({}, '', `${location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new Event('filters:change'));
    onChange?.();
  }, [onChange]);

  return (
    <div className="flex flex-wrap gap-3">
      {/* Proveedor */}
      <select
        className="border rounded px-3 py-2"
        value={proveedor}
        onChange={(e) => {
          const p = e.target.value;
          setProveedor(p);
          // reset dependientes
          setDivision('');
          setLinea('');
          setRubro('');
          applyToUrl(p, '', '', '');
        }}
      >
        <option value="">Todos los proveedores</option>
        {proveedores.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>

      {/* División */}
      <select
        className="border rounded px-3 py-2"
        value={division}
        onChange={(e) => {
          const d = e.target.value;
          setDivision(d);
          setLinea('');
          setRubro('');
          applyToUrl(proveedor, d, '', '');
        }}
        disabled={!proveedor}
      >
        <option value="">{proveedor ? 'Todas las divisiones' : 'Seleccioná una división'}</option>
        {divisiones.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      {/* Línea */}
      <select
        className="border rounded px-3 py-2"
        value={linea}
        onChange={(e) => {
          const l = e.target.value;
          setLinea(l);
          setRubro('');
          applyToUrl(proveedor, division, l, '');
        }}
        disabled={!proveedor || !division}
      >
        <option value="">{division ? 'Todas las líneas' : 'Seleccioná una línea'}</option>
        {lineas.map((l) => (
          <option key={l} value={l}>{l}</option>
        ))}
      </select>

      {/* Rubro */}
      <select
        className="border rounded px-3 py-2"
        value={rubro}
        onChange={(e) => {
          const r = e.target.value;
          setRubro(r);
          applyToUrl(proveedor, division, linea, r);
        }}
        disabled={!proveedor || !division || !linea}
      >
        <option value="">{(division && linea) ? 'Todos los rubros' : 'Seleccioná un rubro'}</option>
        {rubros.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
