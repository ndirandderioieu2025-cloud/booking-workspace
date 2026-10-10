import type { Metadata } from "next";
import { BookingConfirmation } from "@/components/booking-confirmation";

export const metadata: Metadata = {
  title: "Reservation confirmed | Booking Workspace",
  description: "Your Booking Workspace demonstration reservation confirmation.",
};

export default async function BookingConfirmationPage({ params }: { params: Promise<{ reference: string }> }) {
  return <BookingConfirmation reference={(await params).reference} />;
}
