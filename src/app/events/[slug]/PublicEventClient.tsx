"use client";

import React, { useState } from "react";
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  Mic,
  Star,
  CheckCircle2,
  Share2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Building,
  Radio,
  Copy,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckoutModal } from "@/components/events/CheckoutModal";
import { toast } from "sonner";

export function PublicEventClient({ event }: { event: any }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "schedule" | "speakers" | "venue" | "reviews">("about");

  const lowestPrice =
    event.ticketTypes?.length > 0
      ? Math.min(...event.ticketTypes.map((t: any) => t.price))
      : 0;

  const copyReferralLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/events/${event.slug}?ref=social`;
      navigator.clipboard.writeText(url);
      toast.success("Public event referral link copied to clipboard!");
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
          <div className="flex gap-2">
            {[
              { id: "about", label: "About Event" },
              { id: "schedule", label: `Schedule & Agenda (${event.sessions?.length || 0})` },
              { id: "speakers", label: `Speakers (${event.speakers?.length || 0})` },
              { id: "venue", label: "Venue & Access" },
              { id: "reviews", label: `Reviews (${event.reviews?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={copyReferralLink}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share & Track Ref</span>
          </button>
        </div>

        {/* Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Main Left Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* About Tab */}
            {activeTab === "about" && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-4">Event Overview</h3>
                  <div className="prose prose-invert max-w-none text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </div>
                </div>

                {/* FAQ Box */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-base font-bold text-white">Frequently Asked Questions</h3>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="font-bold text-slate-200">How do I access my ticket after purchase?</div>
                      <p className="text-slate-400 mt-1">
                        Your cryptographically signed QR ticket is issued immediately upon order settlement. You can view it in &quot;My Tickets&quot; or download the digital PDF pass.
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <div className="font-bold text-slate-200">Can I transfer or upgrade my ticket?</div>
                      <p className="text-slate-400 mt-1">
                        Yes, tickets can be transferred directly to a colleague or upgraded via the Attendee Portal up to 24 hours before the event starts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Tab */}
            {activeTab === "schedule" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Multi-Track Conference Agenda</h3>
                  <span className="text-xs text-indigo-400 font-semibold">{event.sessions?.length || 0} Sessions</span>
                </div>

                {event.sessions?.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                    Agenda is being finalized by event organizers.
                  </div>
                ) : (
                  event.sessions.map((sess: any) => (
                    <div
                      key={sess.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono font-bold">
                            {formatDate(sess.startTime, "HH:mm")} - {formatDate(sess.endTime, "HH:mm")} WIB
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{sess.room || "Main Stage"}</span>
                          {sess.track && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                              {sess.track}
                            </span>
                          )}
                        </div>
                        <h4 className="text-base font-bold text-white">{sess.title}</h4>
                        {sess.description && (
                          <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{sess.description}</p>
                        )}
                      </div>

                      {sess.speakers?.length > 0 && (
                        <div className="flex items-center gap-2 shrink-0">
                          {sess.speakers.map((spkRel: any) => (
                            <div key={spkRel.id} className="flex items-center gap-2 text-xs">
                              <img
                                src={spkRel.speaker.avatar || ""}
                                alt={spkRel.speaker.name}
                                className="w-8 h-8 rounded-full object-cover border border-slate-700"
                              />
                              <div className="hidden sm:block text-left">
                                <div className="font-bold text-slate-200">{spkRel.speaker.name}</div>
                                <div className="text-[10px] text-slate-400">{spkRel.speaker.company}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Speakers Tab */}
            {activeTab === "speakers" && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-lg font-bold text-white">Featured Keynotes & Leaders</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.speakers.map((s: any) => (
                    <div key={s.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4">
                      <img
                        src={s.avatar || ""}
                        alt={s.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{s.name}</h4>
                        <div className="text-xs text-indigo-400 font-semibold">{s.role}</div>
                        {s.company && <div className="text-[11px] text-slate-400">{s.company}</div>}
                        {s.bio && <p className="text-xs text-slate-400 mt-2 line-clamp-3">{s.bio}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Venue Tab */}
            {activeTab === "venue" && (
              <div className="space-y-6 animate-fade-in">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-400" />
                    <h3 className="text-base font-bold text-white">Venue Logistics & Access</h3>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                    <div className="font-bold text-slate-200 text-sm">{event.venue?.name || "Venue"}</div>
                    <div className="text-slate-400">{event.venue?.address || "Address"}</div>
                    <div className="text-slate-400">{event.venue?.city}, Indonesia</div>
                  </div>

                  {event.venue?.meetingUrl && (
                    <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-indigo-300">Live Virtual Stream</div>
                        <div className="text-slate-400">{event.venue.platform || "Zoom / YouTube"}</div>
                      </div>
                      <a
                        href={event.venue.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold flex items-center gap-1"
                      >
                        <span>Join Meeting</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Verified Attendee Reviews</h3>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>5.0 (Verified Attendance)</span>
                  </div>
                </div>

                {event.reviews?.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                    Reviews open after attendee check-in.
                  </div>
                ) : (
                  event.reviews.map((r: any) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                            {r.attendee?.name.substring(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{r.attendee?.name}</div>
                            <div className="text-[10px] text-slate-500">{formatDate(r.createdAt, "dd MMM yyyy")}</div>
                          </div>
                        </div>
                        <div className="flex text-amber-400">
                          {[...Array(r.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">&quot;{r.feedback}&quot;</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Ticket Tiers & Checkout Card (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 sticky top-20">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  Available Passes
                </span>
                <h3 className="text-lg font-black text-white">Select Admission Tier</h3>
              </div>

              {/* Tiers List */}
              <div className="space-y-3">
                {event.ticketTypes.map((tier: any) => {
                  const perks = tier.perksJson ? JSON.parse(tier.perksJson) : [];
                  const isSoldOut = tier.soldCount >= tier.quota;
                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isSoldOut
                          ? "bg-slate-950/50 border-slate-800 opacity-60"
                          : "bg-slate-950 border-slate-800 hover:border-indigo-500/50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-white">{tier.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{tier.description}</p>
                        </div>
                        <span className="text-sm font-black text-indigo-400 shrink-0 font-mono">
                          {formatCurrency(tier.price)}
                        </span>
                      </div>

                      {perks.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800/80 space-y-1">
                          {perks.map((p: string) => (
                            <div key={p} className="text-[11px] text-slate-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Main Ticket CTA Trigger */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Ticket className="w-4 h-4" />
                <span>Buy Tickets (From {formatCurrency(lowestPrice)})</span>
              </button>

              <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant confirmation • Simulated payment sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        event={event}
      />
    </>
  );
}
