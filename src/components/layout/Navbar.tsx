"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Compass,
  QrCode,
  Ticket,
  LayoutDashboard,
  Search,
  User,
  Sparkles,
  ChevronDown,
  Menu,
  X,
  Layers,
} from "lucide-react";
import { CommandPalette } from "../ui/CommandPalette";

export function Navbar({ currentRole = "ORGANIZER" }: { currentRole?: string }) {
  const pathname = usePathname();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(currentRole);

  const roles = [
    { role: "ORGANIZER", label: "Organizer", badge: "Admin/Org", link: "/organizer" },
    { role: "STAFF", label: "Staff Scanner", badge: "Scanner Lead", link: "/scanner" },
    { role: "SPEAKER", label: "Speaker", badge: "Keynote", link: "/speaker" },
    { role: "ATTENDEE", label: "Attendee", badge: "Customer", link: "/attendee/tickets" },
    { role: "SUPER_ADMIN", label: "Super Admin", badge: "System", link: "/admin" },
  ];

  const navLinks = [
    { href: "/events", label: "Explore Events", icon: <Compass className="w-4 h-4" /> },
    { href: "/events/nusantara-developer-conference-2026", label: "Demo NDC 2026", icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
    { href: "/scanner", label: "Live QR Scanner", icon: <QrCode className="w-4 h-4 text-emerald-500" /> },
    { href: "/organizer", label: "Organizer Dashboard", icon: <LayoutDashboard className="w-4 h-4 text-indigo-500" /> },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  EVENTRA
                </span>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">
                  Event Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Search Shortcut */}
            <button
              onClick={() => setIsCommandOpen(true)}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search platform...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
                Ctrl K
              </kbd>
            </button>

            {/* Role Switcher (For Demo & Fast Evaluation) */}
            <div className="relative">
              <button
                onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Role: <strong className="text-indigo-600 dark:text-indigo-400">{activeRole}</strong></span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-50 animate-fade-in">
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                    Switch Test Persona
                  </div>
                  {roles.map((r) => (
                    <Link
                      key={r.role}
                      href={r.link}
                      onClick={() => {
                        setActiveRole(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                        activeRole === r.role
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span>{r.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {r.badge}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* My Tickets / CTA */}
            <Link
              href="/attendee/tickets"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-500" />
              <span>My Tickets</span>
            </Link>

            <Link
              href="/organizer/events/new"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors"
            >
              <span>+ Create Event</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-2 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
            <Link
              href="/attendee/tickets"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <Ticket className="w-4 h-4 text-amber-500" />
              My Purchased Tickets
            </Link>
          </div>
        )}
      </header>

      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </>
  );
}
