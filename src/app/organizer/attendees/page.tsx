import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  Ticket,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function AttendeesManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ eventId?: string; search?: string; status?: string }>;
}) {
  const { eventId, search, status } = await searchParams;

  const whereClause: any = {};
  if (eventId) {
    whereClause.eventId = eventId;
  }
  if (status && status !== "ALL") {
    whereClause.checkInStatus = status;
  }
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { company: { contains: search } },
    ];
  }

  const [attendees, totalCount, events] = await Promise.all([
    prisma.attendee.findMany({
      where: whereClause,
      include: {
        event: true,
        order: true,
        ticket: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.attendee.count({ where: whereClause }),
    prisma.event.findMany({
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Guest Registry
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Attendee & Order Management
          </h1>
          <p className="text-xs text-slate-400">
            View attendee records, ticket status, check-in timestamps, and export CSV reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/export${eventId ? `?eventId=${eventId}` : ""}`}
            download
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export Roster CSV</span>
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form method="GET" action="/organizer/attendees" className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              name="search"
              defaultValue={search || ""}
              placeholder="Search by name, email, or company (e.g. 'Siti', 'Gojek')..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              name="eventId"
              defaultValue={eventId || ""}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Events ({events.length})</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
            >
              Filter Roster
            </button>
          </div>
        </form>
      </div>

      {/* Attendees Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <span>Showing {attendees.length} of {totalCount} registered attendees</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-3">Attendee</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">Ticket ID / Tier</th>
                <th className="pb-3">Order & Pay</th>
                <th className="pb-3">Check-in Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attendees.map((a) => (
                <tr key={a.id} className="hover:bg-slate-950/40 transition-colors">
                  <td className="py-3.5">
                    <div className="font-bold text-slate-100">{a.name}</div>
                    <div className="text-[11px] text-slate-400">{a.email}</div>
                    {a.company && (
                      <div className="text-[10px] text-slate-500">
                        {a.company} ({a.jobTitle || "Attendee"})
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 max-w-xs truncate">
                    <div className="font-semibold text-slate-200 truncate">{a.event.title}</div>
                    <div className="text-[10px] text-slate-500">
                      {formatDate(a.event.startDate, "dd MMM yyyy")}
                    </div>
                  </td>
                  <td className="py-3.5">
                    <div className="font-mono text-indigo-400 font-semibold">
                      {a.ticket?.ticketNumber || "N/A"}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 font-mono">
                      {a.ticket?.ticketType?.name || "General"}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="font-mono text-slate-300">{a.order.orderNumber}</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      PAID ({a.order.paymentMethod || "QRIS"})
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                        a.checkInStatus === "CHECKED_IN"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {a.checkInStatus === "CHECKED_IN" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Checked In</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          <span>Not Checked-in</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      href={`/certificate/CERT-NDC-1000`}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                    >
                      Certificate
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
