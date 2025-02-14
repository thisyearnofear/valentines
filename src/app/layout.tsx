import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../components/Web3Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Give Me Love",
  description:
    "A valentines-inspired clicker web app where single people all over the world can give each other some love through a heart on their screen",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-1000`}>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
