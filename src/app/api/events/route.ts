import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const format = searchParams.get("format");
    const search = searchParams.get("search");
    const status = searchParams.get("status") || "PUBLISHED";

    const whereClause: any = {};

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (category) {
      whereClause.category = { slug: category };
    }

    if (format && format !== "ALL") {
      whereClause.format = format;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { summary: { contains: search } },
        { venue: { city: { contains: search } } },
      ];
    }

    const events = await prisma.event.findMany({
      where: whereClause,
      include: {
        category: true,
        venue: true,
        ticketTypes: true,
        organization: true,
        speakers: true,
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      summary,
      description,
      categoryId,
      format = "PHYSICAL",
      startDate,
      endDate,
      capacity = 500,
      venueName,
      venueAddress,
      venueCity,
      meetingUrl,
      ticketTypes = [],
      speakers = [],
      registrationFields = [],
      scheduleItems = [],
    } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, message: "Event title, start date, and end date are required." },
        { status: 400 }
      );
    }

    // Default organizer
    const org = await prisma.organization.findFirst();
    if (!org) {
      return NextResponse.json({ success: false, message: "No organization found" }, { status: 500 });
    }

    const baseSlug = slugify(title);
    const uniqueSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Create Event in transaction
    const newEvent = await prisma.event.create({
      data: {
        orgId: org.id,
        title,
        slug: uniqueSlug,
        summary: summary || title,
        description: description || `Welcome to ${title}`,
        categoryId: categoryId || null,
        format,
        status: "DRAFT",
        coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        capacity: Number(capacity) || 500,
        isPublic: true,
        venue: {
          create: {
            name: venueName || (format === "ONLINE" ? "Online Stream" : "Main Hall"),
            address: venueAddress || venueCity || "Jakarta",
            city: venueCity || "Jakarta",
            meetingUrl: meetingUrl || null,
          },
        },
      },
    });

    // Create ticket types if provided
    if (ticketTypes.length > 0) {
      for (const t of ticketTypes) {
        await prisma.ticketType.create({
          data: {
            eventId: newEvent.id,
            name: t.name,
            description: t.description || null,
            price: Number(t.price) || 0,
            quota: Number(t.quota) || 100,
          },
        });
      }
    } else {
      // Default ticket tier
      await prisma.ticketType.create({
        data: {
          eventId: newEvent.id,
          name: "General Admission",
          description: "Full event access",
          price: 0,
          quota: 200,
        },
      });
    }

    // Create speakers if provided
    if (speakers.length > 0) {
      for (let i = 0; i < speakers.length; i++) {
        const s = speakers[i];
        await prisma.speaker.create({
          data: {
            eventId: newEvent.id,
            name: s.name,
            role: s.role || "Featured Speaker",
            company: s.company || org.name,
            bio: s.bio || null,
            avatar: s.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            sortOrder: i + 1,
          },
        });
      }
    }

    // Create schedule sessions if provided
    if (scheduleItems.length > 0) {
      for (let i = 0; i < scheduleItems.length; i++) {
        const item = scheduleItems[i];
        await prisma.sessionItem.create({
          data: {
            eventId: newEvent.id,
            title: item.title,
            description: item.description || null,
            track: item.track || "Main Track",
            room: item.room || "Main Stage",
            startTime: item.startTime ? new Date(item.startTime) : new Date(startDate),
            endTime: item.endTime ? new Date(item.endTime) : new Date(endDate),
            sortOrder: i + 1,
          },
        });
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        eventId: newEvent.id,
        userName: "Organizer",
        userRole: "ORGANIZER",
        action: "CREATED_EVENT",
        entity: "Event",
        entityId: newEvent.id,
        details: `Created new draft event "${title}"`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Event created successfully in Draft status",
      event: newEvent,
    });
  } catch (error) {
    console.error("Event creation error:", error);
    return NextResponse.json({ success: false, message: "Failed to create event" }, { status: 500 });
  }
}
