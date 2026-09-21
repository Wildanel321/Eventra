import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LiveScanner } from "@/components/scanner/LiveScanner";
import { prisma } from "@/lib/prisma";
import { QrCode, ShieldCheck, Zap, Smartphone, Sparkles } from "lucide-react";

export const revalidate = 0;

export default async function ScannerPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string }>;
}) {
  const { eventId } = await searchParams;

  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
  });

  const activeEvent = eventId
    ? events.find((e) => e.id === eventId)
    : events.find((e) => e.slug === "nusantara-developer-conference-2026") || events[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentRole="STAFF" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Console Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Live On-Site Operation
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Event Turnstile Check-in Scanner
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              High-speed barcode/QR scanner with instant cryptographic ticket verification & duplicate prevention.
            </p>
          </div>

          {/* Event Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Target Event:</span>
            <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold text-indigo-400">
              {activeEvent?.title || "Nusantara Developer Conference 2026"}
            </div>
          </div>
        </div>

        {/* Scanner Component */}
        <div className="mt-6">
          <LiveScanner
            eventId={activeEvent?.id}
            eventTitle={activeEvent?.title}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
