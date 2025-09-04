import { useEffect, useState } from 'react';

type Props = {
  searchTerm?: string;
};

export default function Header({ searchTerm = '' }: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState(searchTerm);

  // sincroniza cuando cambia la prop (por back/forward o carga inicial)
  useEffect(() => setQ(searchTerm), [searchTerm]);

  // Actualiza el querystring y dispara búsqueda en tiempo real
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQ(value);
    const sp = new URLSearchParams(window.location.search);
    if (value.trim()) sp.set('q', value.trim());
    else sp.delete('q');
    history.replaceState({}, '', `${location.pathname}?${sp.toString()}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-20 bg-white shadow-md">
      <div className="bg-white py-8 px-4">
        <div className="container mx-auto flex items-center justify-between">
          {/* IZQ: Burger + Logos */}
          <div className="flex items-center">
            <button
              type="button"
              className="p-2 lg:hidden bg-transparent focus:outline-none"
              aria-label="Menú"
              aria-expanded={open}
              onClick={() => setOpen(v => !v)}
            >
              <svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {open ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>

            {/* Logo móvil */}
            <a href="/catalogo/" className="ml-2 block lg:hidden">
              <img src="/newLogoBlack.png" className="h-8" alt="Logo móvil" />
            </a>

            {/* Logo desktop */}
            <a href="/catalogo/" className="hidden lg:block">
              <img src="/logoAzul.png" className="h-8" alt="Logo desktop" />
            </a>
          </div>

          {/* CENTRO: Buscador (solo aquí) */}
          <div className="flex-1 mx-4 max-w-full lg:max-w-md">
            <form className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>

              <input
                type="search"
                name="q"
                value={q}
                onChange={onInputChange}
                placeholder="Buscar por producto, proveedor o ID…"
                className="w-full border border-gray-300 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </form>
          </div>

          {/* DERECHA: Nav desktop */}
          <nav className="hidden lg:flex space-x-6">
            <a href="#" className="no-underline text-md font-semibold text-[#012b67] border py-2.5 px-5 rounded-full hover:bg-[#012b67] hover:text-white transition">
              Quienes somos
            </a>
            <a href="#" className="no-underline text-md font-semibold text-[#012b67] border py-2.5 px-5 rounded-full hover:bg-[#012b67] hover:text-white transition">
              Catálogo
            </a>
            <a href="#" className="no-underline text-md font-semibold text-[#012b67] border py-2.5 px-5 rounded-full hover:bg-[#012b67] hover:text-white transition">
              Combos
            </a>
          </nav>
        </div>

        {/* Menú móvil */}
        {open && (
          <nav className="container mx-auto mt-4 lg:hidden">
            <ul className="flex flex-col gap-2">
              {['Quienes somos','Catálogo','Combos'].map(txt => (
                <li key={txt}>
                  <a
                    href="#"
                    className="block w-full text-left no-underline text-md font-semibold text-blue-600 border py-2.5 px-5 rounded-full hover:bg-blue-600 hover:text-white transition"
                    onClick={() => setOpen(false)}
                  >
                    {txt}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}