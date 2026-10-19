export const PAGE_SIZES = [5, 10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

export interface Paginated<T> {
  data: T[];
  count: number;
}

export interface PaginationParams {
  page?: string;
  page_size?: string;
}

export function parsePagination(params: PaginationParams) {
  const page = Math.max(1, Math.floor(Number(params.page)) || 1);
  const requested_size = Number(params.page_size);
  const page_size = (PAGE_SIZES as readonly number[]).includes(requested_size)
    ? requested_size
    : DEFAULT_PAGE_SIZE;
  return { page, page_size };
}

export function pageRange(page: number, page_size: number) {
  const from = (page - 1) * page_size;
  return { from, to: from + page_size - 1 };
}
