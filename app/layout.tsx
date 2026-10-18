import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentOrganizationId, getOrganizations } from "@/lib/organization";
import { OrganizationSelector } from "./organization-selector";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quality Control",
  description: "Inspection of production batches",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b px-6 py-3 flex gap-6 items-center">
          <Link href="/" className="font-semibold">
            Quality Control
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/inspections">Inspections</Link>
            <Link href="/products">Products</Link>
            <Link href="/organizations">Organizations</Link>
          </nav>
          <div className="ml-auto flex gap-3 items-center text-sm">
            <Suspense fallback={null}>
              <CurrentOrganization />
            </Suspense>
          </div>
        </header>
        <main className="flex-1 p-6 max-w-4xl w-full mx-auto">{children}</main>
      </body>
    </html>
  );
}

async function CurrentOrganization() {
  const [organizations, currentId] = await Promise.all([
    getOrganizations(),
    getCurrentOrganizationId(),
  ]);
  return (
    <OrganizationSelector organizations={organizations} currentId={currentId} />
  );
}
