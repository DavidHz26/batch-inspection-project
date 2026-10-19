"use client";

import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function ClickableRow({
  href,
  label,
  class_name = "",
  children,
}: {
  href: string;
  label: string;
  class_name?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (window.getSelection()?.toString()) return;
    
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      window.open(href, "_blank", "noopener");
      return;
    }
    
    router.push(href);
  };

  const handleAuxClick = (event: MouseEvent<HTMLTableRowElement>) => {
    if (event.button === 1) window.open(href, "_blank", "noopener");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>) => {
    if (event.key === "Enter") router.push(href);
  };

  return (
    <tr
      role="link"
      tabIndex={0}
      aria-label={label}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => router.prefetch(href)}
      className={`cursor-pointer hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600 ${class_name}`}
    >
      {children}
    </tr>
  );
}
