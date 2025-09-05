// src/components/CatalogoGrid.tsx
import { useEffect, useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../types/products';

type ApiBuscarResp = {
  data: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
};

interface Props {
  searchTerm?: string;
}

export default function CatalogoGrid({ searchTerm = '' }: Props) {
  const [items, setItems]           = useState<Product[]>([]);
  const [page, setPage]             = useState(1);
  const [limit]                     = useState(24); // 👈 trae 24 por “página”
  const [total, setTotal]           = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);

  // filtros desde el querystring
  const [provider, setProvider] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('proveedor') || '';
  });
  const [division, setDivision] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('division') || '';
  });
  const [linea, setLinea] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('linea') || '';
  });
  const [rubro, setRubro] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('rubro') || '';
  });

  // reaccionar a cambios del querystring (atrás/adelante o evento custom)
  useEffect(() => {
    const onPop = () => {
      const sp = new URLSearchParams(window.location.search);
      setProvider(sp.get('proveedor') || '');
      setDivision(sp.get('division') || '');
      setLinea(sp.get('linea') || '');
      setRubro(sp.get('rubro') || '');
      setPage(1);         // reset página
      setItems([]);       // 👈 limpiar acumulado
    };
    window.addEventListener('popstate', onPop);
    window.addEventListener('filters:change', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('filters:change', onPop);
    };
  }, []);

  // si cambia el término de búsqueda desde props, resetea
  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [searchTerm]);

  // parámetros de búsqueda
  const qs = useMemo(() => {
    const params = new URLSearchParams({
      action: 'buscar',
      // tu backend acepta busqueda (y si querés también q: hacé el alias en PHP)
      busqueda: searchTerm.trim(),
      page: String(page),
      limit: String(limit),
    });
    if (provider) params.set('proveedor', provider);
    if (division) params.set('division', division);
    if (linea)    params.set('linea', linea);
    if (rubro)    params.set('rubro', rubro);
    return params.toString();
  }, [searchTerm, provider, division, linea, rubro, page, limit]);

  // fetch a la API PHP (APPEND)
  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`https://tests-enzo.distrial.com.ar/db.php?${qs}`, { signal: ctrl.signal, credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as ApiBuscarResp;

        if ((json as any).error) throw new Error(String((json as any).error));

        // 👇 si page === 1 reemplaza; si no, agrega al final
        setItems(prev => (page === 1 ? (json.data ?? []) : [...prev, ...(json.data ?? [])]));
        setTotal(json.total ?? 0);
        setTotalPages(json.totalPages ?? 1);
      })
      .catch((err: any) => {
        if (err?.name !== 'AbortError') setError(err.message || 'Error cargando datos');
      })
      .finally(() => setLoading(false));

    return () => {
      ctrl.abort();
    };
  }, [qs, page]); // page en deps para que al incrementarla traiga y agregue

  const hasMore = page < totalPages;

  return (
    <div>
      {/* Estado: cargando / error / vacío */}
      {loading && page === 1 && (
        <div className="mt-4 text-center text-sm text-gray-600">Cargando…</div>
      )}
      {error && (
        <div className="mt-4 text-center text-sm text-red-600">Error: {error}</div>
      )}
      {!loading && !error && items.length === 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">No se encontraron resultados.</div>
      )}

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-4">
        {items.map((p) => (
          <ProductCard key={p.idArticulo} product={p} />
        ))}
      </div>

      {/* Footer: “Cargar más” (append) */}
      <div className="flex flex-col items-center gap-3 mt-8">
        <span className="text-sm text-gray-600">
          Mostrando <strong>{items.length}</strong> de <strong>{total}</strong>
        </span>

        {hasMore ? (
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            {loading ? 'Cargando…' : 'Cargar más'}
          </button>
        ) : (
          items.length > 0 && (
            <span className="text-sm text-gray-500">No hay más resultados</span>
          )
        )}
      </div>
    </div>
  );
}
