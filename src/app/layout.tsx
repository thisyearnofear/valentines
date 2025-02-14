import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "../components/Web3Provider";
import { FarcasterFrameProvider } from "../components/FarcasterFrameProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "lub-u",
  description: "share love with frens",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: "https://lub-u.vercel.app/og-image.png",
      button: {
        title: "Share lub",
        action: {
          type: "launch_frame",
          name: "lub-u",
          url: "https://lub-u.vercel.app",
          splashImageUrl: "https://lub-u.vercel.app/favicon.ico",
          splashBackgroundColor: "#fad1cf",
        },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} transition-colors duration-1000`}>
        <Web3Provider>
          <FarcasterFrameProvider>{children}</FarcasterFrameProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
