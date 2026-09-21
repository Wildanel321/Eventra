import React from "react";
import Link from "next/link";
import { Layers, ShieldCheck, Zap, Globe, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base">
                <Layers className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                EVENTRA
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Enterprise-grade Event Management Platform for creating, selling tickets, scanning QR check-ins, and managing end-to-end event operations.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Signed QR Code Security
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                Sub-second Check-in
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Explore Events
                </Link>
              </li>
              <li>
                <Link href="/organizer/events/new" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Create Event
                </Link>
              </li>
              <li>
                <Link href="/scanner" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Live Scanner
                </Link>
              </li>
              <li>
                <Link href="/attendee/tickets" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  My Tickets
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Organizers
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/organizer" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/organizer/attendees" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Attendee Manager
                </Link>
              </li>
              <li>
                <Link href="/organizer/analytics" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Real-time Analytics
                </Link>
              </li>
              <li>
                <Link href="/organizer/certificates" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Certificates
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
              Developer Demo
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/events/nusantara-developer-conference-2026" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Demo: NDC 2026
                </Link>
              </li>
              <li>
                <Link href="/certificate/CERT-NDC-1000" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link href="/organizer/settings" className="hover:text-indigo-600 dark:hover:text-indigo-400">
                  System Settings
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} Eventra Platform Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Indonesia (IDR / WIB)
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
