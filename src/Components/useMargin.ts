// src/components/useMargin.ts
import { useEffect, useState } from "react";

export const useMargin = (costoManual: number, precioLista4: number) => {
  const calcInicial = () =>
    precioLista4 ? 1 - costoManual / precioLista4 : 0;

  const [margen, setMargen] = useState(calcInicial);

  // 🔑 Resincroniza margen cuando cambian costoManual o precioLista4
  useEffect(() => {
    setMargen(calcInicial());
  }, [costoManual, precioLista4]);

  const precioFinal = (costoManual / (1 - margen)) * 1.21;

  return { margen, setMargen, precioFinal };
};
