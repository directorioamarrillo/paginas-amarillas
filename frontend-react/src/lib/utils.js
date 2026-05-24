import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind CSS condicionalmente de forma segura.
 * Útil para componentes reutilizables donde queremos permitir
 * sobrescribir estilos (ej. pasar `className="bg-red-500"` a un botón).
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
