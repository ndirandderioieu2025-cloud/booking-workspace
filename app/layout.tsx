import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Header } from "@/components/header";
import "./globals.css";

export const metadata: Metadata = {
  title: "Booking Workspace | Workspaces by the hour",
  description:
    "Discover and reserve affordable cafés, study spaces, coworking desks and meeting rooms by the hour in Madrid.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={GeistSans.variable} data-scroll-behavior="smooth">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
