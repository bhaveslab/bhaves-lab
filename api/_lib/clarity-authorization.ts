import type { VercelRequest } from "@vercel/node";

/** A server-verified booking-link subject, not a required customer account. */
export type VerifiedIdentity = { subject: string };
export type VerifiedBooking = {
  ownerSubject: string;
  status: "requested" | "confirmed" | "cancelled";
  paymentStatus: "unpaid" | "paid" | "refunded";
  reservationStatus: "pending" | "confirmed" | "cancelled";
};
export type ClarityContext = {
  infrastructureReady: boolean;
  identity: VerifiedIdentity | null;
  booking: VerifiedBooking | null;
};

/** Only server-authenticated identity and server-fetched booking records belong here.
 * Request fields, URL claims, email receipts and browser state are never evidence.
 */
export function hasConfirmedRoomAccess(context: ClarityContext): boolean {
  const { infrastructureReady, identity, booking } = context;
  return (
    infrastructureReady &&
    !!identity?.subject &&
    !!booking &&
    booking.ownerSubject === identity.subject &&
    booking.status === "confirmed" &&
    booking.paymentStatus === "paid" &&
    booking.reservationStatus === "confirmed"
  );
}

export async function resolveClarityContext(
  _req: VercelRequest,
): Promise<ClarityContext> {
  if (typeof process === "undefined" || process.env.BOOKING_ENABLED !== "true")
    return { infrastructureReady: false, identity: null, booking: null };
  try {
    const { runtime } = await import("./booking/runtime.js");
    const { authorized } = await import("./booking/service.js");
    const raw = _req.headers?.authorization;
    if (typeof raw !== "string" || !raw.startsWith("Bearer "))
      return { infrastructureReady: true, identity: null, booking: null };
    const b = await authorized(await runtime(), raw.slice(7), "room");
    return { infrastructureReady: true, identity: { subject: b.id }, booking: {
      ownerSubject: b.id, status: "confirmed", paymentStatus: "paid", reservationStatus: "confirmed",
    }};
  } catch {
    return { infrastructureReady: false, identity: null, booking: null };
  }
}
