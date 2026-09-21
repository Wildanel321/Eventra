"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Ticket,
  QrCode,
  BarChart3,
  Megaphone,
  Award,
  Star,
  Settings,
  PlusCircle,
  Building2,
  ChevronDown,
  Layers,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

export function Sidebar({ eventId }: { eventId?: string }) {
  const pathname = usePathname();
  const [activeOrg, setActiveOrg] = useState("Nusantara Tech Foundation");

  const generalNavItems = [
    { label: "Dashboard", href: "/organizer", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Events", href: "/organizer/events", icon: <Calendar className="w-4 h-4" /> },
    { label: "Attendees & Orders", href: "/organizer/attendees", icon: <Users className="w-4 h-4" /> },
    { label: "Live Check-in Scanner", href: "/scanner", icon: <QrCode className="w-4 h-4 text-emerald-500" /> },
    { label: "Analytics & Reports", href: "/organizer/analytics", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Certificates", href: "/organizer/certificates", icon: <Award className="w-4 h-4" /> },
    { label: "Settings", href: "/organizer/settings", icon: <Settings className="w-4 h-4" /> },
  ];

  // Specific Event Context Navigation when managing a single event
  const eventNavItems = eventId
    ? [
        { label: "Overview", href: `/organizer/events/${eventId}`, icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Registrations & Tickets", href: `/organizer/events/${eventId}#tickets`, icon: <Ticket className="w-4 h-4" /> },
        { label: "Attendees & Check-in", href: `/organizer/events/${eventId}#attendees`, icon: <Users className="w-4 h-4" /> },
        { label: "Schedule & Agenda", href: `/organizer/events/${eventId}#schedule`, icon: <Calendar className="w-4 h-4" /> },
        { label: "Marketing & Promo", href: `/organizer/events/${eventId}#marketing`, icon: <Megaphone className="w-4 h-4" /> },
        { label: "Reviews & Feedback", href: `/organizer/events/${eventId}#reviews`, icon: <Star className="w-4 h-4" /> },
      ]
    : [];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <Layers className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-white leading-none">
              EVENTRA
            </span>
            <span className="text-[10px] font-semibold text-indigo-400 tracking-wider uppercase">
              Organizer Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Organization Switcher */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate font-medium text-slate-200">{activeOrg}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
            ORG
          </span>
        </div>
      </div>

      {/* Create Event Button */}
      <div className="p-3">
        <Link
          href="/organizer/events/new"
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event Wizard</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-6">
        {eventId && (
          <div>
            <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-400 flex items-center justify-between">
              <span>Event Context</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              {eventNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Platform Management
          </div>
          <div className="space-y-0.5">
            {generalNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Quick Demos
          </div>
          <div className="space-y-0.5">
            <Link
              href="/events/nusantara-developer-conference-2026"
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-slate-900 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Public NDC 2026</span>
            </Link>
            <Link
              href="/certificate/CERT-NDC-1000"
              className="flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium text-sky-400 hover:bg-slate-900 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span>Sample Certificate</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* User Profile Badge at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-700 text-white font-semibold flex items-center justify-center text-xs">
            WO
          </div>
          <div className="flex flex-col truncate">
            <span className="text-xs font-semibold text-slate-200 truncate">Wildan Organizer</span>
            <span className="text-[10px] text-slate-500 truncate">organizer@eventra.io</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
