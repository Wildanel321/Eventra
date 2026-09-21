import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTicketCode, generateOrderNumber } from "@/lib/utils";
import { signTicketPayload } from "@/lib/qr";
import { activePaymentProvider } from "@/lib/payment-provider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      eventId,
      customerName,
      customerEmail,
      customerPhone,
      company,
      jobTitle,
      ticketTypeId,
      quantity = 1,
      couponCode,
      paymentMethod = "QRIS",
      customFields = {},
      referralCode,
    } = body;

    if (!eventId || !customerName || !customerEmail || !ticketTypeId) {
      return NextResponse.json(
        { success: false, message: "Please fill in all mandatory contact and ticket details" },
        { status: 400 }
      );
    }

    // Fetch event and ticket tier
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: true,
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    const ticketType = event.ticketTypes.find((t) => t.id === ticketTypeId);
    if (!ticketType) {
      return NextResponse.json({ success: false, message: "Ticket tier not found" }, { status: 404 });
    }

    // Check quota
    if (ticketType.soldCount + quantity > ticketType.quota) {
      return NextResponse.json(
        {
          success: false,
          message: `Ticket sold out! Only ${ticketType.quota - ticketType.soldCount} tickets remaining.`,
          isSoldOut: true,
        },
        { status: 400 }
      );
    }

    const subtotal = ticketType.price * quantity;
    let discount = 0;
    let validCoupon = null;

    // Validate Coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          eventId,
          code: couponCode.trim().toUpperCase(),
          isActive: true,
        },
      });

      if (coupon && coupon.usedCount < coupon.quota && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, subtotal);
        }
        validCoupon = coupon;
      }
    }

    const total = Math.max(0, subtotal - discount);
    const orderNumber = generateOrderNumber();

    // Create Order and Items in transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        eventId,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "081234567890",
        subtotal,
        discount,
        total,
        status: total === 0 ? "PAID" : "PAID", // Auto-mark paid for simulation
        paymentMethod: total === 0 ? "FREE" : paymentMethod,
        couponCode: validCoupon ? validCoupon.code : null,
        referralCode: referralCode || null,
        items: {
          create: {
            ticketTypeId: ticketType.id,
            quantity,
            unitPrice: ticketType.price,
            totalPrice: subtotal,
          },
        },
      },
    });

    // Create Payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: total,
        provider: "MOCK_GATEWAY",
        providerTxId: `TX-SIM-${Date.now()}`,
        paymentMethod: order.paymentMethod || "QRIS",
        status: "PAID",
        paidAt: new Date(),
      },
    });

    // Create Attendee & Ticket
    const attendee = await prisma.attendee.create({
      data: {
        eventId,
        orderId: order.id,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        company: company || null,
        jobTitle: jobTitle || null,
        checkInStatus: "NOT_CHECKED_IN",
      },
    });

    // Save custom form values
    if (Object.keys(customFields).length > 0) {
      for (const [fieldId, val] of Object.entries(customFields)) {
        try {
          await prisma.registrationValue.create({
            data: {
              attendeeId: attendee.id,
              fieldId,
              value: typeof val === "object" ? JSON.stringify(val) : String(val),
            },
          });
        } catch {
          // continue if duplicate or non-existent
        }
      }
    }

    // Generate signed QR ticket
    const ticketCode = generateTicketCode("EVT", ticketType.name);
    const { qrCodeData, qrSecret } = signTicketPayload({
      ticketNumber: ticketCode,
      eventId: event.id,
      ticketTypeId: ticketType.id,
      attendeeId: attendee.id,
      attendeeName: customerName,
      attendeeEmail: customerEmail,
      eventTitle: event.title,
      ticketTier: ticketType.name,
      issuedAt: new Date().toISOString(),
    });

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber: ticketCode,
        ticketTypeId: ticketType.id,
        eventId: event.id,
        orderId: order.id,
        attendeeId: attendee.id,
        qrCode: qrCodeData,
        qrSecret: qrSecret,
        status: "VALID",
      },
    });

    // Update ticket soldCount
    await prisma.ticketType.update({
      where: { id: ticketType.id },
      data: {
        soldCount: {
          increment: quantity,
        },
      },
    });

    // Update coupon usage count if used
    if (validCoupon) {
      await prisma.coupon.update({
        where: { id: validCoupon.id },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // Update referral tracking if referralCode matches
    if (referralCode) {
      const campaign = await prisma.eventCampaign.findFirst({
        where: {
          eventId,
          code: referralCode.toLowerCase(),
        },
      });
      if (campaign) {
        await prisma.eventCampaign.update({
          where: { id: campaign.id },
          data: {
            registrations: { increment: 1 },
            revenue: { increment: total },
          },
        });
      }
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        eventId,
        userName: customerName,
        userRole: "ATTENDEE",
        action: "PURCHASED_TICKET",
        entity: "Order",
        entityId: order.orderNumber,
        details: `Purchased ${quantity}x ${ticketType.name} for ${event.title} (Total: Rp${total.toLocaleString()})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Order placed successfully! Ticket confirmed.",
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        discount: order.discount,
        subtotal: order.subtotal,
        status: order.status,
      },
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        qrPayload: qrCodeData,
        attendeeName: attendee.name,
        attendeeEmail: attendee.email,
        tier: ticketType.name,
        eventTitle: event.title,
      },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during order processing" },
      { status: 500 }
    );
  }
}
