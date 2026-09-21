"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Camera,
  RefreshCw,
  Users,
  Volume2,
  VolumeX,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Html5Qrcode } from "html5-qrcode";

interface ScanResult {
  status: "SUCCESS" | "ALREADY_USED" | "INVALID" | "ERROR";
  message: string;
  ticket?: {
    ticketNumber: string;
    attendeeName: string;
    attendeeEmail: string;
    tier: string;
    eventTitle?: string;
    checkedInAt?: string | Date;
    checkedInBy?: string;
    company?: string;
    jobTitle?: string;
  };
}

interface CheckInLog {
  id: string;
  attendeeName: string;
  ticketNumber: string;
  tier: string;
  timestamp: string;
  staffName: string;
  method: string;
}

export function LiveScanner({ eventId, eventTitle }: { eventId?: string; eventTitle?: string }) {
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestResult, setLatestResult] = useState<ScanResult | null>(null);
  const [recentLogs, setRecentLogs] = useState<CheckInLog[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    checkedInCount: 0,
    remainingCount: 0,
    checkInRate: 0,
  });

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrRegionId = "html5qr-code-region";

  // Audio synthesize beep for scan feedback
  const playAudioFeedback = (type: "success" | "warning" | "error") => {
    if (!soundEnabled || typeof window === "undefined") return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
        osc.frequency.setValueAtTime(1174, audioCtx.currentTime + 0.08); // D6
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === "warning") {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(350, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // AudioContext not allowed before user gesture
    }
  };

  // Fetch real-time stats
  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/check-in${eventId ? `?eventId=${eventId}` : ""}`);
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        if (data.recentCheckIns) {
          setRecentLogs(data.recentCheckIns);
        }
      }
    } catch (err) {
      console.error("Failed to load checkin stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 6000);
    return () => clearInterval(interval);
  }, [eventId]);

  // Handle Check-in submit
  const handleCheckIn = async (codeOrQr: string, isQrString: boolean = false) => {
    if (!codeOrQr || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketCode: isQrString ? undefined : codeOrQr,
          qrDataString: isQrString ? codeOrQr : undefined,
          eventId,
          staffName: "Staff Scanner",
        }),
      });

      const data: ScanResult = await res.json();
      setLatestResult(data);

      if (data.status === "SUCCESS") {
        playAudioFeedback("success");
        toast.success(`Check-in Approved: ${data.ticket?.attendeeName} (${data.ticket?.tier})`);
        fetchStats();
      } else if (data.status === "ALREADY_USED") {
        playAudioFeedback("warning");
        toast.warning(data.message);
      } else {
        playAudioFeedback("error");
        toast.error(data.message || "Invalid ticket");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error during check-in validation");
    } finally {
      setIsProcessing(false);
      setManualCode("");
    }
  };

  // Camera Scanner Lifecycle
  const startCamera = async () => {
    try {
      const html5QrCode = new Html5Qrcode(qrRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Scanned successfully
          handleCheckIn(decodedText, true);
        },
        () => {
          // frame parse error, silent
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error("Camera start error:", err);
      toast.error("Unable to access camera. Please allow camera permissions or use manual ticket code lookup.");
      setIsScanning(false);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error("Camera stop error:", err);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header & Real-time Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Total Tickets Issued</div>
          <div className="text-2xl font-black text-white mt-1">{stats.totalTickets}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across all tiers</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-emerald-400 font-medium">Checked-in (Live)</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.checkedInCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{stats.checkInRate}% attendance</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <div className="text-xs text-amber-400 font-medium">Remaining at Gate</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.remainingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending arrivals</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Audio Feedback</div>
            <div className="text-sm font-semibold text-white mt-1">
              {soundEnabled ? "Enabled (Beep)" : "Muted"}
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-indigo-400" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Camera Feed & Manual Input (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-white">Live Camera QR Scanner</h3>
              </div>
              <button
                onClick={isScanning ? stopCamera : startCamera}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isScanning
                    ? "bg-rose-600 hover:bg-rose-500 text-white"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isScanning ? "Turn Off Camera" : "Activate Smartphone Camera"}</span>
              </button>
            </div>

            {/* Camera Viewport Container */}
            <div className="relative w-full aspect-square max-h-80 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col items-center justify-center">
              <div id={qrRegionId} className="w-full h-full object-cover" />

              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 backdrop-blur-xs">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-950/80 border border-indigo-800/50 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Camera Standby</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Click &quot;Activate Camera&quot; above to scan printed attendee badges or smartphone QR tickets.
                  </p>
                  <button
                    onClick={startCamera}
                    className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                  >
                    Start Scanner
                  </button>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 pointer-events-none">
                  <div className="w-full h-48 border-2 border-indigo-500/80 rounded-xl relative">
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white" />
                    <div className="absolute inset-x-0 h-0.5 bg-red-500 scanner-laser shadow-lg shadow-red-500/50" />
                  </div>
                </div>
              )}
            </div>

            {/* Manual Code Lookup Form */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Manual Ticket / Name Lookup
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckIn(manualCode, false);
                }}
                className="flex gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="Enter Ticket ID (e.g. EVT-2026-VIP-8F72A1)..."
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualCode.trim() || isProcessing}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors"
                >
                  {isProcessing ? "Verifying..." : "Validate & Check-in"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right: Instant Scan Result Banner & Live Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Status Result Card */}
          {latestResult ? (
            <div
              className={`p-5 rounded-2xl border text-sm animate-fade-in transition-all ${
                latestResult.status === "SUCCESS"
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-100"
                  : latestResult.status === "ALREADY_USED"
                  ? "bg-amber-950/40 border-amber-500/50 text-amber-100"
                  : "bg-rose-950/40 border-rose-500/50 text-rose-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {latestResult.status === "SUCCESS" ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : latestResult.status === "ALREADY_USED" ? (
                  <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-base leading-tight">
                    {latestResult.status === "SUCCESS"
                      ? "CHECK-IN APPROVED"
                      : latestResult.status === "ALREADY_USED"
                      ? "TICKET ALREADY USED"
                      : "INVALID TICKET"}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">{latestResult.message}</p>
                </div>
              </div>

              {latestResult.ticket && (
                <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-70">Attendee Name:</span>
                    <span className="font-bold text-white">{latestResult.ticket.attendeeName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Ticket Tier:</span>
                    <span className="font-bold px-2 py-0.5 rounded bg-white/10 text-white font-mono">
                      {latestResult.ticket.tier}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Ticket Code:</span>
                    <span className="font-mono font-medium">{latestResult.ticket.ticketNumber}</span>
                  </div>
                  {latestResult.ticket.company && (
                    <div className="flex justify-between">
                      <span className="opacity-70">Company / Role:</span>
                      <span>
                        {latestResult.ticket.company} ({latestResult.ticket.jobTitle || "Attendee"})
                      </span>
                    </div>
                  )}
                  {latestResult.ticket.checkedInAt && (
                    <div className="flex justify-between">
                      <span className="opacity-70">Timestamp:</span>
                      <span>{new Date(latestResult.ticket.checkedInAt).toLocaleTimeString()}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
              <QrCode className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <h4 className="text-sm font-semibold text-slate-200">Awaiting Scan</h4>
              <p className="text-xs mt-1">Scan a ticket QR or type a code to view attendee status.</p>
            </div>
          )}

          {/* Live Recent Check-in Feed */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Recent Check-ins
                </h4>
              </div>
              <button
                onClick={fetchStats}
                className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {recentLogs.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-500">
                  No check-ins recorded yet.
                </div>
              ) : (
                recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{log.attendeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.ticketNumber} • {log.tier}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900/60 font-semibold">
                        ✓ {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
