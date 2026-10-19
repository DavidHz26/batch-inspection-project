import type { ReactNode } from "react";
import Link from "next/link";
import { PAGE_SIZES } from "@/lib/pagination";

type QueryParams = Record<string, string | undefined>;

function HiddenParams({ params }: { params: QueryParams }) {
  return Object.entries(params).map(([name, value]) =>
    value ? <input key={name} type="hidden" name={name} value={value} /> : null,
  );
}

export function PageSizeSelect({ page_size }: { page_size: number }) {
  return (
    <label className="grid gap-1">
      Rows per page
      <select name="page_size" defaultValue={page_size.toString()}>
        {PAGE_SIZES.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </label>
  );
}

export function PageSizeForm({
  page_size,
  params = {},
}: {
  page_size: number;
  params?: QueryParams;
}) {
  return (
    <form className="flex flex-wrap gap-3 items-end text-sm mb-4">
      <HiddenParams params={params} />
      <PageSizeSelect page_size={page_size} />
      <button
        type="submit"
        className="px-3 py-1.5 border rounded bg-primary text-primary-foreground"
      >
        Apply
      </button>
    </form>
  );
}

export function ScrollTable({ children }: { children: ReactNode }) {
  return (
    <div className="max-h-[60vh] sm:max-h-[500px] overflow-auto border rounded-md">
      <table className="w-full min-w-max border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">{children}</table>
    </div>
  );
}

export const SCROLL_TABLE_HEAD_CLASS = "sticky top-0 bg-background shadow-sm z-10";

export function Pagination({
  base_path,
  page,
  page_size,
  count,
  params = {},
}: {
  base_path: string;
  page: number;
  page_size: number;
  count: number;
  params?: QueryParams;
}) {
  const total_pages = Math.max(1, Math.ceil(count / page_size));
  const current_page = Math.min(page, total_pages);

  const pageUrl = (target_page: number) => {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value) search.set(name, value);
    }
    search.set("page", target_page.toString());
    search.set("page_size", page_size.toString());
    return `${base_path}?${search.toString()}`;
  };

  const navButton = (label: string, target_page: number, enabled: boolean) =>
    enabled ? (
      <Link href={pageUrl(target_page)} className="px-3 py-1 border rounded">
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
        Page {current_page} of {total_pages} (Total: {count} records)
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <form method="GET" className="flex items-center gap-1">
          <HiddenParams params={params} />
          <input type="hidden" name="page_size" value={page_size} />
          <span>Go to:</span>
          <input
            type="number"
            name="page"
            min={1}
            max={total_pages}
            defaultValue={current_page}
            className="w-16 px-2 py-1 border rounded text-center"
          />
        </form>

        <div className="flex gap-2">
          {navButton("Previous", current_page - 1, current_page > 1)}
          {navButton("Next", current_page + 1, current_page < total_pages)}
        </div>
      </div>
    </div>
  );
}
