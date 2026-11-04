import type { VercelRequest } from "@vercel/node";

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
  // No authentication or booking-record provider is configured in this project.
  // Remain closed. Implement server session verification + authoritative booking lookup
  // together once the underlying integrations are approved; never accept client claims.
  return { infrastructureReady: false, identity: null, booking: null };
}
