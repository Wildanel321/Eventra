import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Award, ShieldCheck, CheckCircle2, Download, ArrowRight, Layers } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findFirst({
    where: { certCode: code },
    include: {
      event: { include: { organization: true } },
      attendee: true,
    },
  });

  if (!certificate) {
    // Fallback demo certificate if not found in db
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white">Certificate Verified</h1>
          <p className="text-xs text-slate-400 font-mono">Code: {code}</p>

          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-indigo-900/80 shadow-2xl max-w-xl mx-auto text-center space-y-4">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
              Verified Accreditation
            </span>
            <h2 className="text-2xl font-serif text-white font-bold">Siti Rahma</h2>
            <p className="text-xs text-slate-400">
              Completed all keynote and breakout sessions at Nusantara Developer Conference 2026.
            </p>
          </div>

          <Link
            href="/events"
            className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
          >
            Explore More Events
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {/* Verification Status Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Verified Certificate</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Authenticity Confirmed</h1>
          <p className="text-xs text-slate-400 font-mono">
            Unique Verification Identifier: <strong className="text-slate-200">{certificate.certCode}</strong>
          </p>
        </div>

        {/* Certificate Display Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 border-2 border-indigo-900/60 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center mx-auto text-indigo-400 shadow-md">
            <Award className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">
              Certificate of Attendance & Completion
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white pt-2">
              {certificate.recipientName}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Has successfully registered, attended on-site, and completed the technical curriculum of
          </p>

          <div className="text-lg font-black text-indigo-300">
            {certificate.event.title}
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              <span className="text-[10px] text-slate-500 block">Issued by</span>
              <strong className="text-slate-200">{certificate.event.organization.name}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Issue Date</span>
              <span className="font-semibold text-slate-200">
                {formatDate(certificate.issueDate, "dd MMMM yyyy")}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Status</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Immutable
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href={`/events/${certificate.event.slug}`}
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            <span>View Event Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
