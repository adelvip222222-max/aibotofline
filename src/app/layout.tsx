import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import Footer from "@/components/Footer";
import localFont from "next/font/local";

// تعريف خط Tajawal المحلي
const tajawal = localFont({
  src: [
    {
      path: "../../public/fonts/Tajawal-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    // لو عندك أوزان تانية، أضفها هنا
    // {
    //   path: "../../public/fonts/Tajawal-Bold.ttf",
    //   weight: "700",
    //   style: "normal",
    // },
  ],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "المساعد الذكي - الكلية الجوية",
  description: "نظام المساعد الذكي للطلاب - الكلية الجوية",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className={`antialiased font-sans ${tajawal.className} min-h-screen flex flex-col`}>
        <div className="flex-1">
          <Providers>{children}</Providers>
        </div>
        <Footer />
      </body>
    </html>
  );
}