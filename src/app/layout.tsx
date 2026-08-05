import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MenuPilot",
  description: "Digital menus and restaurant websites",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        <NextTopLoader
          color="#C45C26"
          height={3}
          showSpinner={false}
          crawl
        />
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  );
}
