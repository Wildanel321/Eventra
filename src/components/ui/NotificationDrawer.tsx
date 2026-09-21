"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Ticket,
  Star,
  X,
  ExternalLink,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  time: string;
  isRead: boolean;
  link?: string;
}

export function NotificationDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "VIP Ticket Quota 95% Reached",
      message: "Only 5 VIP passes left for Nusantara Developer Conference 2026.",
      type: "TICKET",
      time: "10 mins ago",
      isRead: false,
      link: "/organizer/events",
    },
    {
      id: "2",
      title: "New 5-Star Review Received",
      message: "Siti Rahma submitted verified attendee feedback for NDC 2026.",
      type: "REVIEW",
      time: "35 mins ago",
      isRead: false,
      link: "/organizer/events/nusantara-developer-conference-2026#reviews",
    },
    {
      id: "3",
      title: "Payment Confirmed (QRIS)",
      message: "Order #ORD-202609-1001 was successfully settled for Rp500.000.",
      type: "PAYMENT",
      time: "2 hours ago",
      isRead: true,
      link: "/organizer/attendees",
    },
    {
      id: "4",
      title: "System Backup Completed",
      message: "Encrypted SQLite snapshot backed up with 0 integrity errors.",
      type: "SYSTEM",
      time: "1 day ago",
      isRead: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TICKET":
        return <Ticket className="w-4 h-4 text-amber-500" />;
      case "REVIEW":
        return <Star className="w-4 h-4 text-emerald-500" />;
      case "PAYMENT":
        return <CheckCircle className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Notification Center
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3 rounded-lg border text-xs transition-colors ${
                n.isRead
                  ? "bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                  : "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/50 text-slate-800 dark:text-slate-200 font-medium"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span className="p-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                  {getIcon(n.type)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate">{n.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                    {n.message}
                  </p>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={onClose}
                      className="mt-2 inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:underline"
                    >
                      <span>View details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          Realtime push notifications active
        </div>
      </div>
    </div>
  );
}
