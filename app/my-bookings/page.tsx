import type { Metadata } from "next";
import { AccountBookings } from "@/components/account-bookings";

export const metadata: Metadata = { title: "My Bookings | Booking Workspace" };

export default function MyBookingsPage() {
  return <AccountBookings />;
}
