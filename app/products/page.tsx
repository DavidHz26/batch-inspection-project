import { Suspense } from "react";
import Link from "next/link";
import type { PaginationParams } from "@/lib/pagination";
import { ProductTable } from "./product-table";

export default function ProductsPage({ searchParams }: {
  searchParams: Promise<PaginationParams>;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/products/new" className="underline text-sm">
          New product
        </Link>
      </div>

      <Suspense fallback={<p> Loading... </p>}>
        <ProductTable searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
