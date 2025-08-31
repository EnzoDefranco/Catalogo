// src/App.tsx
import { useEffect, useState } from 'react';
import Header from './Components/Header';
import CatalogoGrid from './Components/CatalogoGrid';
import FilterBar from './Components/FilterBar';
import Carrousel from './Components/Carrousel';

export default function App() {
  const [search, setSearch] = useState('');

  // Lee ?q= al cargar y cuando cambia el historial o los filtros
  useEffect(() => {
    const readQ = () => {
      const sp = new URLSearchParams(window.location.search);
      setSearch(sp.get('q') || '');
    };
    readQ();
    window.addEventListener('popstate', readQ);
    window.addEventListener('filters:change', readQ);
    return () => {
      window.removeEventListener('popstate', readQ);
      window.removeEventListener('filters:change', readQ);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo con buscador y burger */}
      <Header searchTerm={search} />
      <Carrousel />

      {/* pt-36 para dejar espacio al header fijo */}
      <main className="max-w-6xl mx-auto p-4">
        <div className="mb-4">
          <FilterBar />
        </div>

        <CatalogoGrid searchTerm={search} />
      </main>
    </div>
  );
}
