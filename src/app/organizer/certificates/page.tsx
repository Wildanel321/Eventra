import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Award, CheckCircle2, Download, ExternalLink, Sparkles, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const revalidate = 0;

export default async function CertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    include: {
      event: true,
      attendee: true,
    },
    take: 20,
    orderBy: { issueDate: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
            Accreditation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Automated Certificates & Verification
          </h1>
          <p className="text-xs text-slate-400">
            Issue cryptographically verifiable digital certificates for checked-in attendees.
          </p>
        </div>

        <Link
          href="/certificate/CERT-NDC-1000"
          target="_blank"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/30"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View Public Verification URL</span>
        </Link>
      </div>

      {/* Certificate Preview Mock */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="p-8 rounded-2xl bg-slate-950 border-2 border-indigo-900/60 max-w-2xl mx-auto text-center space-y-4 shadow-inner">
          <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500 flex items-center justify-center mx-auto text-indigo-400">
            <Award className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
            Certificate of Participation
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif text-white font-bold">
            Siti Rahma
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
            Has successfully participated and completed all keynote & engineering tracks at
          </p>
          <div className="text-sm font-bold text-indigo-300">
            Nusantara Developer Conference 2026
          </div>

          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Certificate ID: <strong>CERT-NDC-1000</strong></span>
            <span className="text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Signature
            </span>
          </div>
        </div>
      </div>

      {/* Issued Certificates Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Issued Certificates Roster</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-semibold">
                <th className="pb-3">Recipient Name</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">Certificate Code</th>
                <th className="pb-3">Issue Date</th>
                <th className="pb-3 text-right">Verification Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {certificates.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-950/40">
                  <td className="py-3 font-semibold text-slate-100">{cert.recipientName}</td>
                  <td className="py-3 text-slate-300">{cert.event.title}</td>
                  <td className="py-3 font-mono text-indigo-400 font-bold">{cert.certCode}</td>
                  <td className="py-3 text-slate-400">{formatDate(cert.issueDate, "dd MMM yyyy")}</td>
                  <td className="py-3 text-right">
                    <Link
                      href={`/certificate/${cert.certCode}`}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1"
                    >
                      <span>Verify</span>
                      <ExternalLink className="w-3 h-3" />
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
