// src/types/products.ts
export interface Product {
  idArticulo: string;
  descripcion: string;
  proveedorNombre: string;
  precioLista4: number;
  stock: number;
  division: string;
  kilosUnitarios?: number;
  eanUnidad?: string;
  ultModificacion?: string;
  imageUrl?: string;
  precioL4?: number;
  costoManual?: number;
}

export const parseDate = (dateStr: string): string => {
  const firstLine = dateStr.split('\n')[0].trim();
  const match = firstLine.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  return match
    ? `${match[1].padStart(2, '0')}/${match[2].padStart(2, '0')}/${match[3]}`
    : '';
};
