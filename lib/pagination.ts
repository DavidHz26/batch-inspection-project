// Paginación compartida por los listados (organizations, products, inspections).

export const PAGE_SIZES = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export interface Paginated<T> {
  data: T[];
  count: number;
}

export interface PaginationParams {
  page?: string;
  pageSize?: string;
}

// Normaliza ?page y ?pageSize: página >= 1 y tamaño limitado a PAGE_SIZES,
// para que valores como page=-1 o pageSize=100000 no lleguen a la consulta.
export function parsePagination(params: PaginationParams) {
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const requestedSize = Number(params.pageSize);
  const pageSize = (PAGE_SIZES as readonly number[]).includes(requestedSize)
    ? requestedSize
    : DEFAULT_PAGE_SIZE;
  return { page, pageSize };
}

// Rango inclusivo para supabase .range(from, to).
export function pageRange(page: number, pageSize: number) {
  const from = (page - 1) * pageSize;
  return { from, to: from + pageSize - 1 };
}
