import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  ShieldCheck,
  Share2,
  CheckCircle2,
  Star,
  ExternalLink,
  Sparkles,
  Building,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PublicEventClient } from "./PublicEventClient";

export const revalidate = 0;

export default async function PublicEventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      category: true,
      venue: true,
      ticketTypes: true,
      organization: true,
      registrationFields: {
        orderBy: { sortOrder: "asc" },
      },
      speakers: {
        orderBy: { sortOrder: "asc" },
      },
      sessions: {
        orderBy: { startTime: "asc" },
        include: {
          speakers: {
            include: {
              speaker: true,
            },
          },
        },
      },
      reviews: {
        where: { isPublic: true },
        include: {
          attendee: true,
        },
      },
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <div className="relative border-b border-slate-800 bg-slate-900/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-800/80 text-indigo-400 text-[11px] font-bold uppercase tracking-wider">
                    {event.category?.name || "Conference"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-[11px] font-bold">
                    {event.format} Event
                  </span>
                  {event.featured && (
                    <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {event.title}
                </h1>

                <p className="text-base text-slate-300 leading-relaxed max-w-2xl">
                  {event.summary}
                </p>

                {/* Logistics Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">Date</div>
                      <div className="font-bold text-white">{formatDate(event.startDate, "dd MMM yyyy")}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500">Time</div>
                      <div className="font-bold text-white">{formatDate(event.startDate, "HH:mm")} WIB</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                    <div className="truncate">
                      <div className="text-[10px] text-slate-500">Location</div>
                      <div className="font-bold text-white truncate">{event.venue?.city || "Jakarta"}</div>
                    </div>
                  </div>
                </div>

                {/* Organizer Info */}
                <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                    {event.organization.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span>Organized by <strong className="text-slate-200">{event.organization.name}</strong></span>
                </div>
              </div>

              {/* Right Media Preview */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl aspect-video relative group">
                  <img
                    src={event.coverImage || ""}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/90 text-slate-200 font-medium backdrop-blur-md">
                      {event.venue?.name || "Virtual Stage"}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
                      Registration Open
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Client Interactive Section (Checkout Modal, Sticky Bar, Tabbed Sections) */}
        <PublicEventClient event={event} />
      </main>

      <Footer />
    </div>
  );
}
