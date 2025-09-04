import { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import type { SingleValue, StylesConfig } from 'react-select';


type Props = { onChange?: () => void };
const API = 'http://localhost/catalogo/db.php';

type Opt = { value: string; label: string };

// Helpers
const toOptions = (arr: string[]): Opt[] => arr.map((x) => ({ value: x, label: x }));
const esc = (s: string) => encodeURIComponent(s);

// Estilos mínimos para “pill” redondeado (podés tunear a gusto)
const pillStyles: StylesConfig<Opt, false> = {
  control: (base, state) => ({
    ...base,
    minWidth: 220,
    borderRadius: 9999,
    borderColor: state.isFocused ? '#93c5fd' : '#d1d5db',
    boxShadow: state.isFocused ? '0 0 0 1px #93c5fd' : 'none',
    ':hover': { borderColor: '#9ca3af' },
    fontSize: 14,
  }),
  valueContainer: (b) => ({ ...b, padding: '2px 10px' }),
  indicatorsContainer: (b) => ({ ...b, paddingRight: 6 }),
  menu: (b) => ({ ...b, borderRadius: 12, overflow: 'hidden' }),
};

export default function FilterBar({ onChange }: Props) {
  // valores desde la URL
  const [proveedor, setProveedor] = useState<string>(() => new URLSearchParams(location.search).get('proveedor') || '');
  const [division,  setDivision]  = useState<string>(() => new URLSearchParams(location.search).get('division')  || '');
  const [linea,     setLinea]     = useState<string>(() => new URLSearchParams(location.search).get('linea')     || '');
  const [rubro,     setRubro]     = useState<string>(() => new URLSearchParams(location.search).get('rubro')     || '');

  // opciones + loading
  const [proveedores, setProveedores] = useState<Opt[]>([]);
  const [divisiones,  setDivisiones]  = useState<Opt[]>([]);
  const [lineas,      setLineas]      = useState<Opt[]>([]);
  const [rubros,      setRubros]      = useState<Opt[]>([]);
  const [loading, setLoading] = useState<{p:boolean; d:boolean; l:boolean; r:boolean}>({
    p:false,d:false,l:false,r:false
  });

  /* ====== combos ====== */

  // Proveedores (depende de división opcional)
  useEffect(() => {
    setLoading((s) => ({ ...s, p: true }));
    const url = division
      ? `${API}?action=proveedores&division=${esc(division)}`
      : `${API}?action=proveedores`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        const opts = toOptions(list);
        setProveedores(opts);
        if (proveedor && !list.includes(proveedor)) {
          setProveedor('');
          applyToUrl('', division, linea, rubro);
        }
      })
      .catch(console.error)
      .finally(() => setLoading((s) => ({ ...s, p:false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division]);

  // Divisiones (depende de proveedor opcional)
  useEffect(() => {
    setLoading((s) => ({ ...s, d:true }));
    const url = proveedor
      ? `${API}?action=divisiones&proveedor=${esc(proveedor)}`
      : `${API}?action=divisiones`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        const opts = toOptions(list);
        setDivisiones(opts);
        if (division && !list.includes(division)) {
          setDivision('');
          setLinea('');
          setRubro('');
          applyToUrl(proveedor, '', '', '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading((s) => ({ ...s, d:false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proveedor]);

  // Líneas (depende de división; proveedor opcional)
  useEffect(() => {
    if (!division) { setLineas([]); setLinea(''); return; }
    setLoading((s) => ({ ...s, l:true }));
    const url = `${API}?action=lineas&division=${esc(division)}${proveedor ? `&proveedor=${esc(proveedor)}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        const opts = toOptions(list);
        setLineas(opts);
        if (linea && !list.includes(linea)) {
          setLinea('');
          setRubro('');
          applyToUrl(proveedor, division, '', '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading((s) => ({ ...s, l:false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, proveedor]);

  // Rubros (depende de división + línea; proveedor opcional)
  useEffect(() => {
    if (!division || !linea) { setRubros([]); setRubro(''); return; }
    setLoading((s) => ({ ...s, r:true }));
    const url = `${API}?action=rubros&division=${esc(division)}&linea=${esc(linea)}${proveedor ? `&proveedor=${esc(proveedor)}` : ''}`;
    fetch(url)
      .then(r => r.json())
      .then((list: string[]) => {
        const opts = toOptions(list);
        setRubros(opts);
        if (rubro && !list.includes(rubro)) {
          setRubro('');
          applyToUrl(proveedor, division, linea, '');
        }
      })
      .catch(console.error)
      .finally(() => setLoading((s) => ({ ...s, r:false })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [division, linea, proveedor]);

  /* ====== URL + notificación ====== */
  const applyToUrl = useMemo(() => (p: string, d: string, l: string, r: string) => {
    const sp = new URLSearchParams(location.search);
    p ? sp.set('proveedor', p) : sp.delete('proveedor');
    d ? sp.set('division',  d) : sp.delete('division');
    l ? sp.set('linea',     l) : sp.delete('linea');
    r ? sp.set('rubro',     r) : sp.delete('rubro');
    const q = sp.toString();
    history.pushState({}, '', q ? `${location.pathname}?${q}` : location.pathname);
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

  // selected objects (react-select espera objeto)
  const selProveedor = proveedores.find(o => o.value === proveedor) || null;
  const selDivision  = divisiones.find(o => o.value === division) || null;
  const selLinea     = lineas.find(o => o.value === linea) || null;
  const selRubro     = rubros.find(o => o.value === rubro) || null;

  // onChange handlers
  const onProveedor = (opt: SingleValue<Opt>) => {
    const v = opt?.value || '';
    setProveedor(v);
    setLinea('');
    setRubro('');
    applyToUrl(v, division, '', '');
  };
  const onDivision = (opt: SingleValue<Opt>) => {
    const v = opt?.value || '';
    setDivision(v);
    setLinea('');
    setRubro('');
    applyToUrl(proveedor, v, '', '');
  };
  const onLinea = (opt: SingleValue<Opt>) => {
    const v = opt?.value || '';
    setLinea(v);
    setRubro('');
    applyToUrl(proveedor, division, v, '');
  };
  const onRubro = (opt: SingleValue<Opt>) => {
    const v = opt?.value || '';
    setRubro(v);
    applyToUrl(proveedor, division, linea, v);
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-[1200px] flex flex-wrap items-center justify-center gap-2 md:gap-3">
        <div className="w-full sm:w-auto">
          <Select
            inputId="proveedor"
            isSearchable
            isClearable
            isLoading={loading.p}
            options={proveedores}
            value={selProveedor}
            onChange={onProveedor}
            placeholder="Todos los proveedores"
            styles={pillStyles}
            classNamePrefix="rs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            inputId="division"
            isSearchable
            isClearable
            isLoading={loading.d}
            options={divisiones}
            value={selDivision}
            onChange={onDivision}
            placeholder="Seleccioná división"
            styles={pillStyles}
            classNamePrefix="rs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            inputId="linea"
            isSearchable
            isClearable
            isDisabled={!division}
            isLoading={loading.l}
            options={lineas}
            value={selLinea}
            onChange={onLinea}
            placeholder={division ? 'Seleccioná línea' : 'Elegí primero una división'}
            styles={pillStyles}
            classNamePrefix="rs"
            noOptionsMessage={() => division ? 'Sin resultados' : 'Elegí una división'}
          />
        </div>

        <div className="w-full sm:w-auto">
          <Select
            inputId="rubro"
            isSearchable
            isClearable
            isDisabled={!division || !linea}
            isLoading={loading.r}
            options={rubros}
            value={selRubro}
            onChange={onRubro}
            placeholder={(division && linea) ? 'Seleccioná rubro' : 'Elegí primero una línea'}
            styles={pillStyles}
            classNamePrefix="rs"
            noOptionsMessage={() => (division && linea) ? 'Sin resultados' : 'Elegí línea'}
          />
        </div>

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
  );
}
