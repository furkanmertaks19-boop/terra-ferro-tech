import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./admin.css";
import { robotsDirective } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: "Admin | Terra Ferro Tech" },
  robots: robotsDirective(false),
  referrer: "no-referrer",
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return children;
}
