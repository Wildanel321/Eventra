"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Calendar,
  Ticket,
  Users,
  BarChart3,
  QrCode,
  Settings,
  PlusCircle,
  FileText,
  HelpCircle,
  X,
  ExternalLink,
} from "lucide-react";

interface SearchItem {
  id: string;
  title: string;
  category: string;
  url: string;
  icon: React.ReactNode;
  shortcut?: string;
}

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const items: SearchItem[] = [
    {
      id: "create-event",
      title: "Create New Event",
      category: "Actions",
      url: "/organizer/events/new",
      icon: <PlusCircle className="w-4 h-4 text-indigo-500" />,
      shortcut: "N",
    },
    {
      id: "live-scanner",
      title: "Live Ticket Scanner & Check-in",
      category: "Operations",
      url: "/scanner",
      icon: <QrCode className="w-4 h-4 text-emerald-500" />,
      shortcut: "S",
    },
    {
      id: "demo-ndc",
      title: "Nusantara Developer Conference 2026",
      category: "Events",
      url: "/events/nusantara-developer-conference-2026",
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: "asia-ux",
      title: "Asia Product & UX Summit 2026",
      category: "Events",
      url: "/events/asia-product-ux-summit-2026",
      icon: <Calendar className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: "dashboard",
      title: "Organizer Overview & Metrics",
      category: "Navigation",
      url: "/organizer",
      icon: <BarChart3 className="w-4 h-4 text-slate-500" />,
    },
    {
      id: "explore-events",
      title: "Explore Public Events",
      category: "Navigation",
      url: "/events",
      icon: <Calendar className="w-4 h-4 text-slate-500" />,
    },
    {
      id: "attendees",
      title: "Attendee & Order Management",
      category: "Navigation",
      url: "/organizer/attendees",
      icon: <Users className="w-4 h-4 text-slate-500" />,
    },
    {
      id: "my-tickets",
      title: "My Purchased Tickets",
      category: "Attendee",
      url: "/attendee/tickets",
      icon: <Ticket className="w-4 h-4 text-amber-500" />,
    },
    {
      id: "certificates",
      title: "Certificates & Verification",
      category: "Navigation",
      url: "/organizer/certificates",
      icon: <FileText className="w-4 h-4 text-sky-500" />,
    },
    {
      id: "settings",
      title: "Organization & System Settings",
      category: "Settings",
      url: "/organizer/settings",
      icon: <Settings className="w-4 h-4 text-slate-500" />,
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onClose();
        // toggle outside
      }
      if (isOpen) {
        if (e.key === "Escape") {
          onClose();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + (filteredItems.length || 1)) % (filteredItems.length || 1));
        } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
          e.preventDefault();
          router.push(filteredItems[selectedIndex].url);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, router, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            type="text"
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-base"
            placeholder="Search events, attendees, tickets, actions (e.g. 'Scanner', 'Nusantara')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching commands or events found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => {
                  router.push(item.url);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  idx === selectedIndex
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {item.icon}
                  </span>
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.category}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.shortcut && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      {item.shortcut}
                    </span>
                  )}
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
              ↑
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
              ↓
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">
              Enter
            </kbd>
          </div>
          <div>
            Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">ESC</kbd> to exit
          </div>
        </div>
      </div>
    </div>
  );
}
