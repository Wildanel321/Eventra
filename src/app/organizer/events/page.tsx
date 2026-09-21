import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Calendar,
  PlusCircle,
  Search,
  MoreVertical,
  ExternalLink,
  Users,
  Ticket,
  MapPin,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function OrganizerEventsListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { status, search } = await searchParams;

  const whereClause: any = {};
  if (status && status !== "ALL") {
    whereClause.status = status;
  }
  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      category: true,
      venue: true,
      ticketTypes: true,
      _count: {
        select: {
          attendees: true,
          tickets: true,
          checkIns: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header & New Event Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Workspace Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Event Management
          </h1>
          <p className="text-xs text-slate-400">
            Configure tickets, track live turnstile admissions, and manage speakers.
          </p>
        </div>

        <Link
          href="/organizer/events/new"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Event Wizard</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: "ALL", label: "All Events" },
            { id: "PUBLISHED", label: "Published & Live" },
            { id: "DRAFT", label: "Drafts" },
            { id: "COMPLETED", label: "Past Events" },
          ].map((tab) => (
            <Link
              key={tab.id}
              href={tab.id === "ALL" ? "/organizer/events" : `/organizer/events?status=${tab.id}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                (status === tab.id || (!status && tab.id === "ALL"))
                  ? "bg-indigo-600 border-indigo-500 text-white"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter events..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 font-sans"
          />
        </div>
      </div>

      {/* Events Data Grid */}
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400 text-xs">
            No events found matching criteria.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ev.status === "PUBLISHED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                          : "bg-amber-950 text-amber-400 border border-amber-900"
                      }`}
                    >
                      {ev.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(ev.startDate, "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-snug">{ev.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {ev.venue?.city || "Jakarta"} ({ev.format})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-sky-400" />
                      {ev._count.attendees} Attendees
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                      {ev._count.checkIns} Checked In
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Link
                  href={`/events/${ev.slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Public Page</span>
                </Link>
                <Link
                  href={`/scanner?eventId=${ev.id}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-semibold"
                >
                  Scanner
                </Link>
                <Link
                  href={`/organizer/events/${ev.id}`}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm flex items-center gap-1"
                >
                  <span>Manage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
