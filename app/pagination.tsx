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
      Items
      <select key={page_size} name="page_size" defaultValue={page_size.toString()}>
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
        className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground"
      >
        Apply
      </button>
    </form>
  );
}

export function ScrollTable({ children }: { children: ReactNode }) {
  return (
    <div className="h-[410px] flex flex-col overflow-auto border rounded-xl bg-surface">
      <table className="w-full min-w-max border-collapse [&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">{children}</table>
    </div>
  );
}

export const SCROLL_TABLE_HEAD_CLASS = "sticky top-0 bg-surface-raised z-10";

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
      <Link href={pageUrl(target_page)} className="px-4 py-1 rounded-full border bg-surface-raised hover:bg-primary hover:border-primary transition-colors">
        {label}
      </Link>
    ) : (
      <span className="px-4 py-1 rounded-full border opacity-40 cursor-not-allowed">
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
            className="w-16 px-2 py-1 text-center"
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
