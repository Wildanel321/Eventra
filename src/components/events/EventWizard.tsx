"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Users,
  Mic,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Globe,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

interface TicketTierDraft {
  name: string;
  description: string;
  price: number;
  quota: number;
}

interface SpeakerDraft {
  name: string;
  role: string;
  company: string;
  avatar: string;
}

interface ScheduleDraft {
  title: string;
  track: string;
  room: string;
  startTime: string;
  endTime: string;
}

export function EventWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Information
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [format, setFormat] = useState<"PHYSICAL" | "ONLINE" | "HYBRID">("PHYSICAL");

  // Step 2: Date & Time
  const [startDate, setStartDate] = useState("2026-11-20T09:00");
  const [endDate, setEndDate] = useState("2026-11-21T18:00");
  const [timezone, setTimezone] = useState("Asia/Jakarta (WIB)");

  // Step 3: Location
  const [venueName, setVenueName] = useState("Grand Sahid Ballroom");
  const [venueCity, setVenueCity] = useState("Jakarta Pusat");
  const [venueAddress, setVenueAddress] = useState("Jl. Jend. Sudirman Kav. 86, Jakarta");
  const [meetingUrl, setMeetingUrl] = useState("");

  // Step 4: Tickets
  const [ticketTypes, setTicketTypes] = useState<TicketTierDraft[]>([
    { name: "Early Bird", description: "All-access 2-day pass", price: 150000, quota: 200 },
    { name: "Regular Pass", description: "Standard conference entry", price: 250000, quota: 500 },
  ]);

  // Step 5: Custom Registration Form
  const [customFields, setCustomFields] = useState([
    { label: "Company / Organization", type: "TEXT", required: true },
    { label: "Job Title", type: "TEXT", required: true },
    { label: "T-Shirt Size", type: "SELECT", required: false },
  ]);

  // Step 6: Speakers
  const [speakers, setSpeakers] = useState<SpeakerDraft[]>([
    {
      name: "Ir. Rayhan Kusuma",
      role: "VP of Engineering",
      company: "Tech Global",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    },
  ]);

  // Step 7: Schedule
  const [scheduleItems, setScheduleItems] = useState<ScheduleDraft[]>([
    {
      title: "Opening Keynote & Welcome",
      track: "Main Hall",
      room: "Ballroom A",
      startTime: "09:00",
      endTime: "10:30",
    },
    {
      title: "Building Scalable Microservices",
      track: "Track 1",
      room: "Room Nusantara",
      startTime: "11:00",
      endTime: "12:30",
    },
  ]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(slugify(val));
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "VIP Pass", description: "Exclusive lounge & speaker dinner", price: 500000, quota: 100 },
    ]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const addSpeaker = () => {
    setSpeakers([
      ...speakers,
      {
        name: "New Keynote Speaker",
        role: "Principal Architect",
        company: "Industry Leader",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      },
    ]);
  };

  const removeSpeaker = (index: number) => {
    setSpeakers(speakers.filter((_, i) => i !== index));
  };

  const addSchedule = () => {
    setScheduleItems([
      ...scheduleItems,
      {
        title: "Deep Dive Architecture Session",
        track: "Track 2",
        room: "Room B",
        startTime: "13:30",
        endTime: "15:00",
      },
    ]);
  };

  // Publish Checklist validation
  const checklist = {
    basic: Boolean(title.trim() && summary.trim()),
    dateTime: Boolean(startDate && endDate),
    location: format === "ONLINE" ? Boolean(meetingUrl.trim() || venueName.trim()) : Boolean(venueName.trim() && venueCity.trim()),
    tickets: ticketTypes.length > 0,
    speakers: speakers.length > 0,
  };

  const isPublishReady = Object.values(checklist).every(Boolean);

  const handleSubmit = async (publishImmediately: boolean = false) => {
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in the required basic info and dates.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          summary,
          description: description || `Welcome to ${title}`,
          format,
          startDate,
          endDate,
          venueName,
          venueAddress,
          venueCity,
          meetingUrl: format !== "PHYSICAL" ? meetingUrl : undefined,
          ticketTypes,
          speakers,
          scheduleItems,
        }),
      });

      const data = await res.json();
      if (data.success) {
        if (publishImmediately && data.event?.id) {
          await fetch(`/api/events/${data.event.id}/publish`, { method: "POST" });
        }
        toast.success(`Event created successfully!`);
        router.push(`/organizer/events`);
      } else {
        toast.error(data.message || "Failed to create event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during event creation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Basic Info", icon: <Layers className="w-4 h-4" /> },
    { num: 2, label: "Date & Time", icon: <Calendar className="w-4 h-4" /> },
    { num: 3, label: "Location", icon: <MapPin className="w-4 h-4" /> },
    { num: 4, label: "Tickets", icon: <Ticket className="w-4 h-4" /> },
    { num: 5, label: "Custom Form", icon: <FileCheck className="w-4 h-4" /> },
    { num: 6, label: "Speakers", icon: <Mic className="w-4 h-4" /> },
    { num: 7, label: "Schedule", icon: <Clock className="w-4 h-4" /> },
    { num: 8, label: "Publish", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Progress Header */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between overflow-x-auto gap-2 pb-1">
          {steps.map((s) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;
            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : isDone
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-950/40 flex items-center justify-center text-[10px]">
                  {isDone ? "✓" : s.num}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Step 1 — Basic Event Information</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Jakarta AI Summit 2026"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  URL Slug (Auto-generated)
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 font-mono">
                  <span>eventra.io/events/</span>
                  <span className="text-indigo-400 font-bold">{slug || "your-event-slug"}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Short Tagline / Summary *
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="e.g. Southeast Asia's premier AI and distributed systems gathering."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Event Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "PHYSICAL", label: "Physical On-site", desc: "Venue & Turnstile Gate" },
                    { id: "ONLINE", label: "Virtual Stream", desc: "Zoom / YouTube Live" },
                    { id: "HYBRID", label: "Hybrid Blend", desc: "On-site + Live Stream" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFormat(f.id as any)}
                      className={`p-3 rounded-xl border text-left transition-colors ${
                        format === f.id
                          ? "bg-indigo-950/60 border-indigo-500 text-white"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="text-xs font-bold">{f.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{f.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Detailed Markdown Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide schedule details, what attendees will learn, and perks..."
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Step 2 — Date & Scheduling</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB, UTC+7)</option>
                <option value="Asia/Makassar">Asia/Makassar (WITA, UTC+8)</option>
                <option value="Asia/Jayapura">Asia/Jayapura (WIT, UTC+9)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+8)</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Step 3 — Venue & Stream Access</h3>
            {format !== "ONLINE" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">Venue Name</label>
                    <input
                      type="text"
                      value={venueName}
                      onChange={(e) => setVenueName(e.target.value)}
                      placeholder="e.g. JIExpo Kemayoran"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">City</label>
                    <input
                      type="text"
                      value={venueCity}
                      onChange={(e) => setVenueCity(e.target.value)}
                      placeholder="e.g. Jakarta Pusat"
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full Address</label>
                  <input
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g. Gedung Pusat Niaga Lt. 1, Kemayoran"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            {format !== "PHYSICAL" && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Live Stream Meeting URL (Zoom / YouTube Live)
                </label>
                <input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://zoom.us/j/987654321"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 4: Tickets */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Step 4 — Ticket Tiers & Pricing</h3>
              <button
                type="button"
                onClick={addTicketType}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Tier
              </button>
            </div>

            <div className="space-y-3">
              {ticketTypes.map((tier, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">Tier #{idx + 1}</span>
                    {ticketTypes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTicketType(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Tier Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => {
                          const updated = [...ticketTypes];
                          updated[idx].name = e.target.value;
                          setTicketTypes(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Price (IDR)</label>
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => {
                          const updated = [...ticketTypes];
                          updated[idx].price = Number(e.target.value);
                          setTicketTypes(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Quota</label>
                      <input
                        type="number"
                        value={tier.quota}
                        onChange={(e) => {
                          const updated = [...ticketTypes];
                          updated[idx].quota = Number(e.target.value);
                          setTicketTypes(updated);
                        }}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Custom Registration Form */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-base font-bold text-white">Step 5 — Custom Registration Questions</h3>
            <p className="text-xs text-slate-400">
              Gather critical information from attendees during checkout.
            </p>
            <div className="space-y-2">
              {customFields.map((f, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{f.label}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono">
                      {f.type}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-indigo-400">
                    {f.required ? "Required" : "Optional"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Speakers */}
        {currentStep === 6 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Step 6 — Speakers & Presenters</h3>
              <button
                type="button"
                onClick={addSpeaker}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Speaker
              </button>
            </div>

            <div className="space-y-3">
              {speakers.map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <div>
                      <div className="text-xs font-bold text-slate-100">{s.name}</div>
                      <div className="text-[11px] text-slate-400">{s.role} • {s.company}</div>
                    </div>
                  </div>
                  {speakers.length > 1 && (
                    <button type="button" onClick={() => removeSpeaker(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Schedule */}
        {currentStep === 7 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Step 7 — Multi-Track Agenda</h3>
              <button
                type="button"
                onClick={addSchedule}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Session
              </button>
            </div>

            <div className="space-y-2">
              {scheduleItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100">{item.title}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.track} • {item.room} ({item.startTime} - {item.endTime})
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Publish Checklist & Launch */}
        {currentStep === 8 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-base font-bold text-white">Step 8 — Launch & Publish Checklist</h3>

            {/* Checklist items */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span>1. Basic event information & tagline</span>
                <span className={checklist.basic ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {checklist.basic ? "✓ COMPLETE" : "✕ INCOMPLETE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>2. Event dates & timezone configuration</span>
                <span className={checklist.dateTime ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {checklist.dateTime ? "✓ COMPLETE" : "✕ INCOMPLETE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>3. Venue physical address or live stream link</span>
                <span className={checklist.location ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {checklist.location ? "✓ COMPLETE" : "✕ INCOMPLETE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>4. At least one active ticket tier configured</span>
                <span className={checklist.tickets ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {checklist.tickets ? "✓ COMPLETE" : "✕ INCOMPLETE"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>5. Keynote speakers assigned</span>
                <span className={checklist.speakers ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                  {checklist.speakers ? "✓ COMPLETE" : "✕ INCOMPLETE"}
                </span>
              </div>
            </div>

            {/* Launch buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSubmit(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs"
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={isSubmitting || !isPublishReady}
                onClick={() => handleSubmit(true)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {isSubmitting ? "Publishing..." : "✓ Publish Event to Public Directory"}
              </button>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 disabled:opacity-30"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.min(8, prev + 1))}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-xs text-slate-500">Step 8 of 8</span>
          )}
        </div>
      </div>
    </div>
  );
}
