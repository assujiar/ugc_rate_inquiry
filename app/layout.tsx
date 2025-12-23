import "./globals.css";
import type { ReactNode } from "react";
import SupabaseProvider from "@/components/SupabaseProvider";

export const metadata = {
  title: "Rate Request App",
  description: "Internal logistics ticketing for rate requests",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-bg text-text min-h-screen">
        <SupabaseProvider>{children}</SupabaseProvider>
      </body>
    </html>
  );
}
