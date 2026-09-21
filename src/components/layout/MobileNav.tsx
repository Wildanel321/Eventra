"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  LayoutDashboard,
  QrCode,
  Ticket,
  User,
  PlusCircle,
} from "lucide-react";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Explore", href: "/events", icon: <Compass className="w-5 h-5" /> },
    { label: "My Tickets", href: "/attendee/tickets", icon: <Ticket className="w-5 h-5" /> },
    {
      label: "Live Scan",
      href: "/scanner",
      icon: <QrCode className="w-6 h-6 text-white" />,
      highlight: true,
    },
    { label: "Studio", href: "/organizer", icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: "Settings", href: "/organizer/settings", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-3 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        if (item.highlight) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center -mt-5 group"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center py-1 px-2 rounded-lg text-xs font-medium transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {item.icon}
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
