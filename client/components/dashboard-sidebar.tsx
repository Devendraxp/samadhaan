"use client"
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type DashboardLink = {
  name: string;
  href: string;
  icon: React.ReactNode;
};

interface DashboardSidebarProps {
  user: {
    name: string;
    role: string;
    image: string;
  };
  links: DashboardLink[];
  className?: string;
}

export function DashboardSidebar({ user, links, className }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "w-full md:w-64 shrink-0 border-r bg-card/50 backdrop-blur-sm md:sticky md:top-0 md:h-[calc(100vh-0px)]",
        "p-4 flex md:flex-col gap-6 md:gap-8",
        className
      )}
    >
      {/* User block */}
      <div className="flex items-center gap-4">
        <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-primary/30">
          <Image
            src={user.image}
            alt={user.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
        <div className="leading-tight">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs px-1 py-[2px] rounded bg-primary/10 text-primary tracking-wide">
              {user.role}
            </div>
        </div>
      </div>

      {/* Links */}
      <nav className="flex-1">
        <ul className="flex md:flex-col gap-2 flex-wrap md:flex-nowrap">
          {links.map(l => {
            const active = pathname === l.href;
            return (
              <li key={l.href} className="w-full">
                <Link
                  href={l.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/15 text-primary font-medium ring-1 ring-primary/30"
                      : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-lg leading-none">{l.icon}</span>
                  <span>{l.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}