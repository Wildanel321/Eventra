"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Bell, ChevronRight, Home, ShieldCheck, User } from "lucide-react";
import { CommandPalette } from "../ui/CommandPalette";
import { NotificationDrawer } from "../ui/NotificationDrawer";

export function TopHeader({ title, breadcrumbs = [] }: { title?: string; breadcrumbs?: { label: string; href?: string }[] }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 w-full h-14 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between">
        {/* Breadcrumb / Title */}
        <div className="flex items-center gap-2 text-xs">
          <Link href="/organizer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Studio</span>
          </Link>

          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />
              {b.href ? (
                <Link href={b.href} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  {b.label}
                </Link>
              ) : (
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                  {b.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
              Ctrl+K
            </kbd>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600" />
          </button>

          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </div>
        </div>
      </header>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <NotificationDrawer isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
}
