"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, History, MessageSquare, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/workspace", label: "Workspace", icon: LayoutGrid },
  { href: "/session",   label: "Memory",    icon: History },
  { href: "/ai-chat",   label: "AI Chat",   icon: MessageSquare },
  { href: "/settings",  label: "Settings",  icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-48 shrink-0 flex flex-col gap-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Button
            key={href}
            variant="ghost"
            asChild
            className={`w-full justify-start gap-3 px-4 py-6 rounded-lg text-sm relative font-medium transition-colors ${
              isActive
                ? "text-[#00E5FF] bg-white/5 hover:bg-white/10"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Link href={href}>
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#00E5FF] rounded-r-full" />
              )}
              <Icon className="size-4" />
              {label}
            </Link>
          </Button>
        );
      })}
    </aside>
  );
}
