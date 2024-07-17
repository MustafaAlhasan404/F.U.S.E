import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { KeyProvider } from "../context/KeyContext"; // Adjust the path as needed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fuse Inc.",
  description: "Fuse Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <KeyProvider>
          {children}
        </KeyProvider>
      </body>
    </html>
  );
}
