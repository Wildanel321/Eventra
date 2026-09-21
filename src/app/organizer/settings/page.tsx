import React from "react";
import { prisma } from "@/lib/prisma";
import {
  Settings,
  Building,
  Shield,
  Bell,
  Key,
  Globe,
  CheckCircle2,
  Lock,
  Smartphone,
  Save,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function SettingsPage() {
  const [org, auditLogs] = await Promise.all([
    prisma.organization.findFirst(),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
          Organization & System Settings
        </h1>
        <p className="text-xs text-slate-400">
          Manage branding color tokens, default currency & timezone, 2FA security, and immutable audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Form: Org Profile */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Building className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Organization Profile & Branding</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  defaultValue={org?.name || "Nusantara Tech Foundation"}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Brand Accent Hex Color Token
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue={org?.brandingColor || "#4F46E5"}
                    className="w-10 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-800"
                  />
                  <input
                    type="text"
                    defaultValue={org?.brandingColor || "#4F46E5"}
                    className="w-32 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs font-mono"
                  />
                  <span className="text-[11px] text-slate-500">
                    Used across all public event headers and tickets
                  </span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  defaultValue={org?.website || "https://nusantaratech.org"}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* Security & 2FA */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Shield className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Security & Two-Factor Authentication (2FA)</h3>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">TOTP Authenticator (Google / Authy)</div>
                  <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                    ✓ 2FA Active on Account
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Reconfigure
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Immutable Audit Log */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Lock className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white">System Audit Log</h3>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>{log.userName}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {formatDate(log.createdAt, "HH:mm")}
                  </span>
                </div>
                <div className="text-[11px] text-indigo-400 font-semibold">{log.action}</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
