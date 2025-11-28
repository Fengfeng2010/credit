import type { Metadata } from "next";
import {Inter, Noto_Sans_SC} from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: "LINUX DO PAY",
  description: "Linux Do 社区支付平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} ${notoSansSC.variable} hide-scrollbar font-sans`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.variable} ${notoSansSC.variable} hide-scrollbar font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
