// src/components/ProductCard.tsx
import type { FC, ImgHTMLAttributes  } from 'react';
// src/components/ProductCard.tsx
import type { Product } from '../types/products'; // 👈 type-only import
import { parseDate } from '../types/products';   // 👈 normal import para función
import { useMargin } from './useMargin';


const FALLBACK_IMG = 'https://demofree.sirv.com/nope-not-here.jpg';

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const fecha = product.ultModificacion ? parseDate(product.ultModificacion) : '';
  const isOutOfStock = product.stock === 0;

  const handleImgError: ImgHTMLAttributes<HTMLImageElement>['onError'] = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMG;
  };

  // Usa tu hook (resincroniza con costo/lista)
  const { margen, setMargen, precioFinal } = useMargin(
    product.costoManual ?? 0,
    // si viene precioL4 desde la API, lo priorizamos sobre precioLista4
    (typeof product.precioL4 === 'number' ? product.precioL4 : product.precioLista4) ?? 0
  );

  const imgSrc = product.imageUrl || `C:/xampp/htdocs/productosImagenesCodEnro/${product.idArticulo}.webp`;

  return (
    <div className="relative flex flex-col justify-between rounded-3xl bg-white p-5 pt-12 text-center shadow-md hover:shadow-lg max-w-xs mx-auto">
      {/* Badges */}
      <div className="absolute top-3 left-3 flex space-x-2">
        {isOutOfStock && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            Sin Stock
          </span>
        )}
        <span className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded">
          {product.division}
        </span>
      </div>

      {/* Kilos badge */}
      {typeof product.kilosUnitarios === 'number' && product.kilosUnitarios > 0 && (
        <div className="absolute top-1 right-1 bg-green-500 text-white text-xs font-medium px-1 rounded-full">
          {product.kilosUnitarios.toFixed(2)} KG
        </div>
      )}

      {/* Imagen */}
      <img
        src={imgSrc}
        alt={product.descripcion}
        className="w-[200px] h-[200px] object-cover rounded-lg mx-auto"
        loading="lazy"
        onError={handleImgError}
      />

      {/* Título y detalles */}
      <div className="mt-4">
        <h3 className="text-md font-semibold text-gray-900 leading-snug mb-1">
          {product.descripcion}
        </h3>
        <p className="text-sm text-gray-700">{product.proveedorNombre}</p>
        <p className="text-xs text-gray-500 mt-1 leading-snug">
          Cod. Enro: {product.idArticulo}
          <br />
          Stock: {product.stock}
          {fecha && (
            <>
              <br />
              Última modif.: {fecha}
            </>
          )}
        </p>
      </div>

      {/* Barra de margen */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Margen: {(margen * 100).toFixed(0)}%
        </label>
        <input
          type="range"
          min={0}
          max={0.5}
          step={0.01}
          value={margen}
          onChange={(e) => setMargen(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Precio final calculado */}
      <div className="mt-2">
        <p className="text-lg font-bold text-gray-900">
          Precio final: ${precioFinal.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
