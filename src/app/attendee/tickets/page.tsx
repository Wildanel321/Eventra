import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  ShieldCheck,
  Download,
  ExternalLink,
  Award,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AttendeeTicketsPage() {
  const tickets = await prisma.ticket.findMany({
    include: {
      event: { include: { venue: true } },
      ticketType: true,
      attendee: { include: { certificate: true } },
      order: true,
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar currentRole="ATTENDEE" />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Attendee Portal
          </span>
          <h1 className="text-3xl font-black text-white mt-1">My Registered Tickets</h1>
          <p className="text-xs text-slate-400">
            Access your cryptographically signed QR admission passes and download certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between"
            >
              {/* Ticket Top Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-950/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono">
                    {t.ticketType.name}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.status === "USED"
                        ? "bg-slate-800 text-slate-400"
                        : "bg-emerald-950 text-emerald-400 border border-emerald-900"
                    }`}
                  >
                    {t.status === "USED" ? "Checked In" : "Valid for Entry"}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white line-clamp-1">{t.event.title}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{formatDate(t.event.startDate, "EEE, dd MMM yyyy, HH:mm")}</span>
                </div>
              </div>

              {/* QR Code Presentation Box */}
              <div className="p-6 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white rounded-xl shadow-inner">
                  <QrCode className="w-36 h-36 text-slate-900" />
                </div>
                <div className="text-center">
                  <div className="font-mono text-xs font-bold text-slate-200 tracking-wider">
                    {t.ticketNumber}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                    {t.attendee.name}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified QR</span>
                </div>
                <div className="flex items-center gap-2">
                  {t.attendee.certificate && (
                    <Link
                      href={`/certificate/${t.attendee.certificate.certCode}`}
                      className="px-2.5 py-1 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-300 font-semibold text-[11px] flex items-center gap-1"
                    >
                      <Award className="w-3 h-3" />
                      <span>Certificate</span>
                    </Link>
                  )}
                  <Link
                    href={`/events/${t.event.slug}`}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px]"
                  >
                    Event Page
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
