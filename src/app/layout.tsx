import type { Metadata } from "next";
import "../styles/globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Eventra — Enterprise Event Management Platform",
  description:
    "Production-grade SaaS platform to create, manage, promote, sell tickets, scan QR check-ins, and orchestrate high-impact events end-to-end.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col">
        {children}
        <Toaster
          position="bottom-right"
          theme="dark"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#0f172a",
              border: "1px solid #1e293b",
              color: "#f8fafc",
            },
          }}
        />
      </body>
    </html>
  );
}
