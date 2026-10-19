import { Suspense } from "react";
import { Loading } from "@/app/loading-text";
import Link from "next/link";
import type { PaginationParams } from "@/lib/pagination";
import { ProductTable } from "./product-table";

export default function ProductsPage({ searchParams }: {
  searchParams: Promise<PaginationParams>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/products/new" className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-colors hover:bg-accent/85">
          <span aria-hidden>+</span> New product
        </Link>
      </div>

      <Suspense fallback={<Loading label="products" />}>
        <ProductTable search_params={searchParams} />
      </Suspense>
    </div>
  );
}
