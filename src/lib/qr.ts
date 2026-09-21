import QRCode from "qrcode";
import crypto from "crypto";

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || "eventra-secure-ticket-secret-2026";

export interface TicketPayload {
  ticketNumber: string;
  eventId: string;
  ticketTypeId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  eventTitle: string;
  ticketTier: string;
  issuedAt: string;
}

export function signTicketPayload(payload: TicketPayload): { qrCodeData: string; qrSecret: string } {
  const dataString = JSON.stringify(payload);
  const signature = crypto
    .createHmac("sha256", QR_SECRET_KEY)
    .update(`${payload.ticketNumber}:${payload.eventId}:${payload.attendeeId}`)
    .digest("hex")
    .substring(0, 16);

  // We pack minimal verifiable payload so camera scans fast
  const packed = JSON.stringify({
    t: payload.ticketNumber,
    e: payload.eventId,
    a: payload.attendeeId,
    s: signature,
  });

  return {
    qrCodeData: packed,
    qrSecret: signature,
  };
}

export function verifyTicketSignature(ticketNumber: string, eventId: string, attendeeId: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", QR_SECRET_KEY)
    .update(`${ticketNumber}:${eventId}:${attendeeId}`)
    .digest("hex")
    .substring(0, 16);
  return expected === signature;
}

export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 320,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Error generating QR code:", err);
    return "";
  }
}
