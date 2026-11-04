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
  // No booking-specific link verifier or authoritative booking lookup is configured.
  // Keep access closed. Customers must not need accounts: verify a scoped access link,
  // then re-fetch its exact calendar appointment and Stripe payment on the server.
  // A redirect, event notification, email address, or free/busy result is not payment proof.
  return { infrastructureReady: false, identity: null, booking: null };
}
