import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const format = searchParams.get("format") || "csv";

    const attendees = await prisma.attendee.findMany({
      where: eventId ? { eventId } : {},
      include: {
        event: true,
        order: true,
        ticket: {
          include: {
            ticketType: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (format === "csv") {
      const headers = [
        "Attendee ID",
        "Name",
        "Email",
        "Phone",
        "Company",
        "Job Title",
        "Event Name",
        "Ticket Number",
        "Ticket Tier",
        "Order Number",
        "Payment Method",
        "Check-In Status",
        "Check-In Timestamp",
        "Registration Date",
      ];

      const rows = attendees.map((a) => [
        `"${a.id}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.email}"`,
        `"${a.phone || ""}"`,
        `"${(a.company || "").replace(/"/g, '""')}"`,
        `"${(a.jobTitle || "").replace(/"/g, '""')}"`,
        `"${a.event.title.replace(/"/g, '""')}"`,
        `"${a.ticket?.ticketNumber || "N/A"}"`,
        `"${a.ticket?.ticketType?.name || "General"}"`,
        `"${a.order.orderNumber}"`,
        `"${a.order.paymentMethod || "MOCK"}"`,
        `"${a.checkInStatus}"`,
        `"${a.checkedInAt ? new Date(a.checkedInAt).toISOString() : ""}"`,
        `"${new Date(a.createdAt).toISOString()}"`,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

      return new Response(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="eventra-attendees-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ success: true, count: attendees.length, attendees });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ success: false, message: "Export failed" }, { status: 500 });
  }
}
