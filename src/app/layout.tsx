import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeSlice — Shape your day",
  description: "A playful visual day planner.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
