// src/App.tsx
import { useEffect, useState } from 'react';
import CatalogoGrid from './Components/CatalogoGrid';
import FilterBar from './Components/FilterBar';

export default function App() {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setSearch(sp.get('q') || '');
  }, []);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const sp = new URLSearchParams(window.location.search);
    if (search.trim()) sp.set('q', search.trim());
    else sp.delete('q');
    history.pushState({}, '', `${location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 bg-white border-b">
        <div className="max-w-6xl mx-auto p-4 space-y-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Catálogo</h1>
            <form onSubmit={onSubmit} className="ml-auto flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="border rounded px-3 py-2 w-72"
              />
              <button className="px-3 py-2 rounded bg-black text-white">Buscar</button>
            </form>
          </div>

          {/* Barra de filtros dependientes */}
          <FilterBar />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <CatalogoGrid searchTerm={search} />
      </main>
    </div>
  );
}
