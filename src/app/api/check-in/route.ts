import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyTicketSignature } from "@/lib/qr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticketCode, qrDataString, eventId, staffId = "staff-default", staffName = "Staff Scanner" } = body;

    let targetTicketNumber = ticketCode;

    // If camera scanned the packed JSON payload: { t: "EVT-...", e: "...", a: "...", s: "..." }
    if (qrDataString) {
      try {
        const parsed = typeof qrDataString === "string" ? JSON.parse(qrDataString) : qrDataString;
        if (parsed.t) {
          targetTicketNumber = parsed.t;
        }
      } catch {
        targetTicketNumber = qrDataString.trim();
      }
    }

    if (!targetTicketNumber) {
      return NextResponse.json(
        { success: false, status: "INVALID", message: "No ticket code provided" },
        { status: 400 }
      );
    }

    // Clean ticket code string
    targetTicketNumber = targetTicketNumber.trim().toUpperCase();

    // Query ticket from database
    const ticket = await prisma.ticket.findFirst({
      where: {
        ticketNumber: targetTicketNumber,
        ...(eventId ? { eventId } : {}),
      },
      include: {
        attendee: true,
        ticketType: true,
        event: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({
        success: false,
        status: "INVALID",
        message: `✕ Invalid Ticket: "${targetTicketNumber}" not found in system database.`,
        ticketCode: targetTicketNumber,
      });
    }

    // Check if already used
    if (ticket.status === "USED") {
      const lastCheckIn = await prisma.checkIn.findFirst({
        where: { ticketId: ticket.id },
        orderBy: { timestamp: "desc" },
      });

      return NextResponse.json({
        success: false,
        status: "ALREADY_USED",
        message: `⚠ TICKET ALREADY USED! Checked in on ${lastCheckIn ? new Date(lastCheckIn.timestamp).toLocaleTimeString() : "earlier"} by ${ticket.checkedInBy || "Gate Staff"}.`,
        ticket: {
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendee.name,
          attendeeEmail: ticket.attendee.email,
          tier: ticket.ticketType.name,
          eventTitle: ticket.event.title,
          checkedInAt: ticket.checkedInAt,
          checkedInBy: ticket.checkedInBy,
        },
      });
    }

    if (ticket.status === "CANCELLED" || ticket.status === "REFUNDED") {
      return NextResponse.json({
        success: false,
        status: "CANCELLED",
        message: `✕ TICKET ${ticket.status}: This ticket is voided and cannot be used for entry.`,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          attendeeName: ticket.attendee.name,
          tier: ticket.ticketType.name,
        },
      });
    }

    // Successful check-in: Update ticket and attendee status, create CheckIn record and AuditLog
    const now = new Date();

    const [updatedTicket, updatedAttendee, newCheckIn] = await prisma.$transaction([
      prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          status: "USED",
          checkedInAt: now,
          checkedInBy: staffName,
        },
      }),
      prisma.attendee.update({
        where: { id: ticket.attendeeId },
        data: {
          checkInStatus: "CHECKED_IN",
          checkedInAt: now,
        },
      }),
      prisma.checkIn.create({
        data: {
          eventId: ticket.eventId,
          ticketId: ticket.id,
          attendeeId: ticket.attendeeId,
          staffName: staffName,
          method: qrDataString ? "CAMERA_SCAN" : "MANUAL",
          notes: "Main Entrance Gate",
          timestamp: now,
        },
      }),
      prisma.auditLog.create({
        data: {
          eventId: ticket.eventId,
          userName: staffName,
          userRole: "STAFF",
          action: "CHECKIN_ATTENDEE",
          entity: "Ticket",
          entityId: ticket.ticketNumber,
          details: `Checked in attendee ${ticket.attendee.name} (${ticket.ticketType.name}) via ${qrDataString ? "Camera Scan" : "Manual Lookup"}`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      status: "SUCCESS",
      message: `✓ CHECK-IN SUCCESSFUL! Welcome, ${ticket.attendee.name}!`,
      ticket: {
        id: updatedTicket.id,
        ticketNumber: updatedTicket.ticketNumber,
        attendeeName: updatedAttendee.name,
        attendeeEmail: updatedAttendee.email,
        company: updatedAttendee.company,
        jobTitle: updatedAttendee.jobTitle,
        tier: ticket.ticketType.name,
        eventTitle: ticket.event.title,
        checkedInAt: now,
        checkedInBy: staffName,
      },
    });
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      { success: false, status: "ERROR", message: "Internal server error during check-in" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch real-time check-in stats
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const filter = eventId ? { eventId } : {};

    const [totalTickets, checkedInCount, recentCheckIns] = await Promise.all([
      prisma.ticket.count({ where: filter }),
      prisma.ticket.count({ where: { ...filter, status: "USED" } }),
      prisma.checkIn.findMany({
        where: filter,
        orderBy: { timestamp: "desc" },
        take: 10,
        include: {
          attendee: true,
          ticket: {
            include: {
              ticketType: true,
            },
          },
        },
      }),
    ]);

    const checkInRate = totalTickets > 0 ? Math.round((checkedInCount / totalTickets) * 100) : 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalTickets,
        checkedInCount,
        remainingCount: totalTickets - checkedInCount,
        checkInRate,
      },
      recentCheckIns: recentCheckIns.map((c) => ({
        id: c.id,
        attendeeName: c.attendee.name,
        ticketNumber: c.ticket.ticketNumber,
        tier: c.ticket.ticketType.name,
        timestamp: c.timestamp,
        staffName: c.staffName || "Staff",
        method: c.method,
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ success: false, message: "Error fetching stats" }, { status: 500 });
  }
}
