import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Expensio",
  description: "Expensio",
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});


const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});


const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${sourceSerif4.variable} ${jetBrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
