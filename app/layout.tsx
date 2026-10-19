import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentOrganizationId, getOrganizations } from "@/lib/organization";
import { OrganizationSelector } from "./organization-selector";
import { AlertProvider } from "./alert-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quality Control",
  description: "Inspection of production batches",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AlertProvider>
          <header className="border-b px-4 py-3 sm:px-6 flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="/" className="font-semibold">
              Quality Control
            </Link>
            <nav className="order-last w-full sm:order-none sm:w-auto flex gap-4 text-sm overflow-x-auto">
              <Link href="/inspections">Inspections</Link>
              <Link href="/products">Products</Link>
              <Link href="/organizations">Organizations</Link>
            </nav>
            <div className="ml-auto flex gap-3 items-center text-sm min-w-0">
              <Suspense fallback={null}>
                <CurrentOrganization />
              </Suspense>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-4xl w-full mx-auto">{children}</main>
        </AlertProvider>
      </body>
    </html>
  );
}

async function CurrentOrganization() {
  const [organizations, current_id] = await Promise.all([
    getOrganizations(),
    getCurrentOrganizationId(),
  ]);
  return (
    <OrganizationSelector organizations={organizations} current_id={current_id} />
  );
}
