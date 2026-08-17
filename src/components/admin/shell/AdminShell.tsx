"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/lib/roles";
import { roleLabel } from "@/lib/roles";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { ToastProvider } from "../ui/Toast";
import { ConfirmProvider } from "../ui/ConfirmDialog";

export default function AdminShell({
  userName,
  role,
  email,
  children,
}: {
  userName: string;
  role: UserRole;
  email: string;
  children: React.ReactNode;
}) {
  void email;
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [command, setCommand] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommand(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="admin-app">
      <ToastProvider>
        <ConfirmProvider>
          <div className="flex min-h-dvh">
            <Sidebar
              collapsed={collapsed}
              onToggle={() => setCollapsed((v) => !v)}
              mobileOpen={mobileOpen}
              onClose={() => setMobileOpen(false)}
              role={role}
            />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar
                userName={userName}
                roleLabel={roleLabel(role)}
                onMenu={() => setMobileOpen(true)}
                onSearch={() => setCommand(true)}
              />
              <main className="flex-1 px-4 py-5 lg:px-6 lg:py-6">{children}</main>
            </div>
          </div>
          <CommandPalette open={command} onClose={() => setCommand(false)} role={role} />
        </ConfirmProvider>
      </ToastProvider>
    </div>
  );
}
