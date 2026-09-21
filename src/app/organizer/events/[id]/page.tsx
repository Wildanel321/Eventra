import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  DollarSign,
  QrCode,
  ExternalLink,
  Sparkles,
  Share2,
  CheckCircle2,
  AlertTriangle,
  Star,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function EventDetailDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      category: true,
      venue: true,
      ticketTypes: true,
      speakers: true,
      sessions: true,
      campaigns: true,
      reviews: {
        include: { attendee: true },
      },
      _count: {
        select: {
          attendees: true,
          tickets: true,
          checkIns: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  const attendees = await prisma.attendee.findMany({
    where: { eventId: id },
    include: {
      ticket: { include: { ticketType: true } },
      order: true,
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = event.ticketTypes.reduce((acc, t) => acc + t.soldCount * t.price, 0);
  const totalTickets = event.ticketTypes.reduce((acc, t) => acc + t.quota, 0);
  const totalSold = event.ticketTypes.reduce((acc, t) => acc + t.soldCount, 0);

  return (
    <div className="space-y-8">
      {/* Event Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold shrink-0">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  event.status === "PUBLISHED"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                    : "bg-amber-950 text-amber-400 border border-amber-900"
                }`}
              >
                {event.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">{event.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">{event.title}</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatDate(event.startDate, "EEE, dd MMM yyyy, HH:mm")} • {event.venue?.name} ({event.venue?.city})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/events/${event.slug}`}
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Page</span>
          </Link>
          <Link
            href={`/scanner?eventId=${event.id}`}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Scanner</span>
          </Link>
        </div>
      </div>

      {/* 4 Focused Event KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Estimated Revenue</div>
          <div className="text-2xl font-black text-white mt-1">{formatCurrency(totalRevenue)}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">Direct ticket sales</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Ticket Inventory</div>
          <div className="text-2xl font-black text-indigo-400 mt-1">
            {totalSold} <span className="text-sm text-slate-500 font-normal">/ {totalTickets}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalTickets > 0 ? Math.round((totalSold / totalTickets) * 100) : 0}% sold out
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Scanned Check-ins</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{event._count.checkIns}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{event._count.attendees} registered</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Keynotes & Sessions</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{event.sessions.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{event.speakers.length} speakers</div>
        </div>
      </div>

      {/* Ticket Tiers Breakdown */}
      <div id="tickets" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Inventory
            </span>
            <h3 className="text-base font-bold text-white">Ticket Tiers & Quota</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {event.ticketTypes.map((tier) => (
            <div key={tier.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{tier.name}</span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {formatCurrency(tier.price)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{
                    width: `${tier.quota > 0 ? (tier.soldCount / tier.quota) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Sold: {tier.soldCount}</span>
                <span>Quota: {tier.quota}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Attendees Roster */}
      <div id="attendees" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Roster
            </span>
            <h3 className="text-base font-bold text-white">Recent Registrations</h3>
          </div>
          <Link
            href="/organizer/attendees"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Full roster & CSV Export</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-3 font-semibold">Attendee Name</th>
                <th className="pb-3 font-semibold">Tier</th>
                <th className="pb-3 font-semibold">Ticket ID</th>
                <th className="pb-3 font-semibold">Check-in Status</th>
                <th className="pb-3 font-semibold">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendees.map((a) => (
                <tr key={a.id} className="hover:bg-slate-950/40">
                  <td className="py-3">
                    <div className="font-semibold text-slate-200">{a.name}</div>
                    <div className="text-[10px] text-slate-500">{a.email}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px]">
                      {a.ticket?.ticketType?.name || "General"}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-indigo-400">{a.ticket?.ticketNumber || "-"}</td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        a.checkInStatus === "CHECKED_IN"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {a.checkInStatus === "CHECKED_IN" ? "✓ Checked In" : "Pending Gate"}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">{formatDate(a.createdAt, "dd MMM, HH:mm")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
