import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const nunito = Nunito({ weight: "500", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TON BatchSender",
  description: "Efficiently send TON to multiple recipients in one go.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.className} flex flex-col min-h-screen`}>
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
