"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LayoutRh } from "../../rh/LayoutRh";

export default function RhLayout({ children }: { children: ReactNode }) {
  return <LayoutRh caminho_atual={usePathname()}>{children}</LayoutRh>;
}
