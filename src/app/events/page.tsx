import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Calendar,
  MapPin,
  Ticket,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
  Globe,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function EventsDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; format?: string; search?: string }>;
}) {
  const { category, format, search } = await searchParams;

  const whereClause: any = { status: "PUBLISHED" };

  if (category) {
    whereClause.category = { slug: category };
  }

  if (format && format !== "ALL") {
    whereClause.format = format;
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search } },
      { summary: { contains: search } },
      { venue: { city: { contains: search } } },
    ];
  }

  const [events, categories] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      include: {
        category: true,
        venue: true,
        ticketTypes: true,
        organization: true,
      },
      orderBy: { startDate: "asc" },
    }),
    prisma.eventCategory.findMany(),
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Directory Header */}
        <div className="space-y-4 mb-8">
          <div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Discovery Engine
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Explore Public Events</h1>
            <p className="text-sm text-slate-400 mt-1">
              Find technical conferences, developer workshops, and executive summits.
            </p>
          </div>

          {/* Search & Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <form method="GET" action="/events" className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="search"
                defaultValue={search || ""}
                placeholder="Search by topic, keyword, or city (e.g. 'Jakarta', 'AI', 'Next.js')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 shadow-inner"
              />
            </form>

            <div className="flex gap-2 overflow-x-auto pb-1">
              <Link
                href="/events"
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  !category && !format
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                All Formats
              </Link>
              <Link
                href="/events?format=PHYSICAL"
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  format === "PHYSICAL"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                Physical On-Site
              </Link>
              <Link
                href="/events?format=ONLINE"
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  format === "ONLINE"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                Virtual Stream
              </Link>
              <Link
                href="/events?format=HYBRID"
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                  format === "HYBRID"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
                }`}
              >
                Hybrid
              </Link>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((c) => {
              const isSelected = category === c.slug;
              return (
                <Link
                  key={c.id}
                  href={isSelected ? "/events" : `/events?category=${c.slug}`}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    isSelected
                      ? "bg-indigo-950 border-indigo-500 text-indigo-300 font-bold"
                      : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-slate-900/30 border border-slate-800/80">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-300">No events matched your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your category filter or search keywords to find other gatherings.
            </p>
            <Link
              href="/events"
              className="mt-4 inline-block px-4 py-2 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((ev) => {
              const lowestPrice =
                ev.ticketTypes.length > 0 ? Math.min(...ev.ticketTypes.map((t) => t.price)) : 0;
              return (
                <div
                  key={ev.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col overflow-hidden group shadow-lg"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={ev.coverImage || ""}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-[10px] font-bold text-slate-200 border border-slate-800">
                      {ev.category?.name || "Summit"}
                    </div>
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-600 text-[10px] font-bold text-white">
                      {ev.format}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(ev.startDate, "EEE, dd MMM yyyy")}</span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {ev.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Starting from</span>
                        <span className="font-bold text-white">{formatCurrency(lowestPrice)}</span>
                      </div>
                      <Link
                        href={`/events/${ev.slug}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
