// src/components/FilterBar.tsx
import { useEffect, useMemo, useState } from 'react';

type Props = {
  onChange?: () => void; // avisamos a CatalogoGrid (o a quien escuche) que cambió algo
};

const API = 'http://localhost/db.php';

export default function FilterBar({ onChange }: Props) {
  // estado seleccionado (desde querystring si existe)
  const [division, setDivision] = useState<string>(() => new URLSearchParams(location.search).get('division') || '');
  const [linea, setLinea]       = useState<string>(() => new URLSearchParams(location.search).get('linea') || '');
  const [rubro, setRubro]       = useState<string>(() => new URLSearchParams(location.search).get('rubro') || '');

  // opciones
  const [divisiones, setDivisiones] = useState<string[]>([]);
  const [lineas, setLineas]         = useState<string[]>([]);
  const [rubros, setRubros]         = useState<string[]>([]);

  // Cargar divisiones al montar
  useEffect(() => {
    fetch(`${API}?action=divisiones`)
      .then(r => r.json())
      .then(setDivisiones)
      .catch(console.error);
  }, []);

  // Cargar líneas cuando cambia división
  useEffect(() => {
    if (!division) {
      setLineas([]);
      setLinea('');
      return;
    }
    fetch(`${API}?action=lineas&division=${encodeURIComponent(division)}`)
      .then(r => r.json())
      .then(setLineas)
      .catch(console.error);
  }, [division]);

  // Cargar rubros cuando cambia división o línea
  useEffect(() => {
    if (!division || !linea) {
      setRubros([]);
      setRubro('');
      return;
    }
    const url = `${API}?action=rubros&division=${encodeURIComponent(division)}&linea=${encodeURIComponent(linea)}`;
    fetch(url)
      .then(r => r.json())
      .then(setRubros)
      .catch(console.error);
  }, [division, linea]);

  // Sincronizar con el querystring y notificar
  const applyToUrl = useMemo(() => (d: string, l: string, r: string) => {
    const sp = new URLSearchParams(location.search);
    d ? sp.set('division', d) : sp.delete('division');
    l ? sp.set('linea', l)     : sp.delete('linea');
    r ? sp.set('rubro', r)     : sp.delete('rubro');
    history.pushState({}, '', `${location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new Event('filters:change')); // para quien escuche (CatalogoGrid)
    onChange?.();
  }, [onChange]);

  return (
    <div className="flex flex-wrap gap-3">
      {/* División */}
      <select
        className="border rounded px-3 py-2"
        value={division}
        onChange={(e) => {
          const d = e.target.value;
          setDivision(d);
          // reset dependientes
          setLinea('');
          setRubro('');
          applyToUrl(d, '', '');
        }}
      >
        <option value="">Todas las divisiones</option>
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
          applyToUrl(division, l, '');
        }}
        disabled={!division}
      >
        <option value="">{division ? 'Todas las líneas' : 'Seleccioná división'}</option>
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
          applyToUrl(division, linea, r);
        }}
        disabled={!division || !linea}
      >
        <option value="">{(division && linea) ? 'Todos los rubros' : 'Seleccioná línea'}</option>
        {rubros.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
    </div>
  );
}
