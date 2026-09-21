import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        ticketTypes: true,
        speakers: true,
        sessions: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    // Validation checklist before publishing
    const checklist = {
      hasBasicInfo: Boolean(event.title && event.summary && event.description),
      hasDateTime: Boolean(event.startDate && event.endDate),
      hasVenue: Boolean(
        event.venue && (event.venue.name || event.venue.city || event.venue.meetingUrl)
      ),
      hasTickets: event.ticketTypes.length > 0,
      hasSpeakersOrSchedule: event.speakers.length > 0 || event.sessions.length > 0,
    };

    const isReady = Object.values(checklist).every(Boolean);

    if (!isReady) {
      return NextResponse.json(
        {
          success: false,
          message: "Event does not pass publish validation checklist.",
          checklist,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.event.update({
      where: { id },
      data: {
        status: "PUBLISHED",
      },
    });

    await prisma.auditLog.create({
      data: {
        orgId: event.orgId,
        eventId: event.id,
        userName: "Organizer",
        userRole: "ORGANIZER",
        action: "PUBLISHED_EVENT",
        entity: "Event",
        entityId: event.id,
        details: `Published event "${event.title}" to public catalog`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Event "${event.title}" is now published and live!`,
      event: updated,
      checklist,
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ success: false, message: "Failed to publish event" }, { status: 500 });
  }
}
