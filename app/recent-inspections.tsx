"use client";

import type { InspectionUnits } from "@/lib/types";

export function RecentInspectionsList({ inspections }: { inspections: InspectionUnits[] }) {
  const recent = inspections.slice(-5).reverse();

  return (
    <div className="bg-surface border rounded-xl p-5 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Recent Inspections Overview</h3>
        <div className="space-y-3">
          {recent.map((item, index) => {
            const rawProduct = Array.isArray(item.products) ? item.products[0] : item.products;
            
            const productLabel = rawProduct 
              ? `${rawProduct.sku} - ${rawProduct.name}` 
              : "General Inspection";

            return (
              <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-surface-raised last:border-0">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${item.units_defective > 0 ? 'bg-danger' : 'bg-success'}`} />
                  <span className="font-medium text-foreground truncate" title={productLabel}>
                    {productLabel}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-right shrink-0">
                  <span>Insp: <strong className="text-foreground">{item.units_inspected}</strong></span>
                  <span className="ml-2">Def: <strong className={item.units_defective > 0 ? 'text-danger' : 'text-foreground'}>{item.units_defective}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pt-4 text-xs text-muted-foreground text-right">
        Showing recent inspections
      </div>
    </div>
  );
}