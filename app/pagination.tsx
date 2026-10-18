import type { ReactNode } from "react";
import Link from "next/link";
import { PAGE_SIZES } from "@/lib/pagination";

// Parámetros de la URL que deben conservarse al paginar (p. ej. filtros).
type QueryParams = Record<string, string | undefined>;

function HiddenParams({ params }: { params: QueryParams }) {
  return Object.entries(params).map(([name, value]) =>
    value ? <input key={name} type="hidden" name={name} value={value} /> : null,
  );
}

// Selector de filas por página para usar dentro de un formulario GET existente.
export function PageSizeSelect({ pageSize }: { pageSize: number }) {
  return (
    <label className="grid gap-1">
      Rows per page
      <select name="pageSize" defaultValue={pageSize.toString()}>
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}

// Formulario propio con el selector, para listados sin formulario de filtros.
export function PageSizeForm({
  pageSize,
  params = {},
}: {
  pageSize: number;
  params?: QueryParams;
}) {
  return (
    <form className="flex flex-wrap gap-3 items-end text-sm mb-4">
      <HiddenParams params={params} />
      <PageSizeSelect pageSize={pageSize} />
      <button
        type="submit"
        className="px-3 py-1.5 border rounded bg-primary text-primary-foreground"
      >
        Apply
      </button>
    </form>
  );
}

// Contenedor con scroll vertical y cabecera fija para las tablas paginadas.
export function ScrollTable({ children }: { children: ReactNode }) {
  return (
    <div className="h-[500px] overflow-y-auto border rounded-md">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}

export const scrollTableHeadClass = "sticky top-0 bg-background shadow-sm z-10";

// Barra inferior: total, salto directo de página y botones anterior/siguiente.
export function Pagination({
  basePath,
  page,
  pageSize,
  count,
  params = {},
}: {
  basePath: string;
  page: number;
  pageSize: number;
  count: number;
  params?: QueryParams;
}) {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageUrl = (targetPage: number) => {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value) search.set(name, value);
    }
    search.set("page", targetPage.toString());
    search.set("pageSize", pageSize.toString());
    return `${basePath}?${search.toString()}`;
  };

  const navButton = (label: string, targetPage: number, enabled: boolean) =>
    enabled ? (
      <Link href={pageUrl(targetPage)} className="px-3 py-1 border rounded">
        {label}
      </Link>
    ) : (
      <span className="px-3 py-1 border rounded opacity-40 cursor-not-allowed">
        {label}
      </span>
    );

  return (
    <div className="flex flex-wrap justify-between items-center mt-4 text-sm gap-4">
      <span>
        Page {currentPage} of {totalPages} (Total: {count} records)
      </span>

      <div className="flex items-center gap-4">
        {/* Salto directo de página mediante un formulario nativo GET */}
        <form method="GET" className="flex items-center gap-1">
          <HiddenParams params={params} />
          <input type="hidden" name="pageSize" value={pageSize} />
          <span>Go to:</span>
          <input
            type="number"
            name="page"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            className="w-16 px-2 py-1 border rounded text-center"
          />
        </form>

        <div className="flex gap-2">
          {navButton("Previous", currentPage - 1, currentPage > 1)}
          {navButton("Next", currentPage + 1, currentPage < totalPages)}
        </div>
      </div>
    </div>
  );
}
