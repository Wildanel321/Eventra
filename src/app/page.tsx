import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Calendar,
  MapPin,
  Ticket,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  Building,
  TrendingUp,
  Award,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function HomePage() {
  const [featuredEvents, upcomingEvents, categories, totalStats] = await Promise.all([
    prisma.event.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: {
        venue: true,
        category: true,
        ticketTypes: true,
        organization: true,
      },
      take: 2,
    }),
    prisma.event.findMany({
      where: { status: "PUBLISHED" },
      include: {
        venue: true,
        category: true,
        ticketTypes: true,
        organization: true,
      },
      orderBy: { startDate: "asc" },
      take: 6,
    }),
    prisma.eventCategory.findMany(),
    Promise.all([
      prisma.event.count({ where: { status: "PUBLISHED" } }),
      prisma.attendee.count(),
      prisma.organization.count(),
      prisma.checkIn.count(),
    ]),
  ]);

  const [eventCount, attendeeCount, orgCount, checkinCount] = totalStats;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-slate-800/80 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))]" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-800/60 text-xs font-semibold text-indigo-300 mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Production-Ready Event Management Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
              Architect, Sell & Run{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
                High-Impact Events
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              From multi-track conference creation and cryptographic QR ticket sales to sub-second live turnstile check-in and post-event automated certificates.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/events/nusantara-developer-conference-2026"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Explore Demo: NDC 2026</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/scanner"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span>Live QR Check-in Scanner</span>
              </Link>
              <Link
                href="/organizer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Organizer Studio</span>
              </Link>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/80 text-left">
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="text-2xl font-black text-white">{eventCount || 15}+</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Active Live Events</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="text-2xl font-black text-indigo-400">{attendeeCount || 100}+</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Registered Attendees</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="text-2xl font-black text-emerald-400">{checkinCount || 35}+</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Scanned Check-ins</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60">
                <div className="text-2xl font-black text-amber-400">&lt; 300ms</div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">Turnstile Scan Speed</div>
              </div>
            </div>
          </div>
        </section>

        {/* Flagship Demo Spotlight: Nusantara Developer Conference 2026 */}
        {featuredEvents[0] && (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="p-1 rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-2xl">
              <div className="bg-slate-950 rounded-[22px] p-6 sm:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-7 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" /> Flagship Showcase Event
                    </div>

                    <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                      {featuredEvents[0].title}
                    </h2>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                      {featuredEvents[0].summary}
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>{formatDate(featuredEvents[0].startDate, "dd MMM yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-400" />
                        <span>{featuredEvents[0].venue?.city || "Jakarta"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-emerald-400" />
                        <span>From {formatCurrency(featuredEvents[0].ticketTypes[0]?.price || 150000)}</span>
                      </div>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-3">
                      <Link
                        href={`/events/${featuredEvents[0].slug}`}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <span>View Full Event & Buy Ticket</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/organizer/events/${featuredEvents[0].id}`}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-semibold text-xs"
                      >
                        Manage in Studio
                      </Link>
                    </div>
                  </div>

                  <div className="lg:col-span-5">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video lg:aspect-4/3">
                      <img
                        src={featuredEvents[0].coverImage || ""}
                        alt={featuredEvents[0].title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                        <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-white font-bold backdrop-blur-md">
                          JIExpo Kemayoran
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
                          95% Quota Sold
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Explore Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Discovery Directory
              </span>
              <h3 className="text-2xl font-black text-white">Browse by Category</h3>
            </div>
            <Link
              href="/events"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>View all 15 events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/events?category=${cat.slug}`}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition-all text-center group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-950 border border-indigo-800/60 text-indigo-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Events Catalog */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              Upcoming Gatherings
            </span>
            <h3 className="text-2xl font-black text-white">Featured Tech & Business Summits</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((ev) => {
              const lowestPrice = ev.ticketTypes.length > 0 ? Math.min(...ev.ticketTypes.map((t) => t.price)) : 0;
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
                      <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {ev.title}
                      </h4>
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
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
