"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      {" "}
      <html lang="en" suppressHydrationWarning>
        {" "}
        <body
          className={`${inter.className} bg-background text-foreground transition-colors`}
        >
          <AuthProvider>{children}</AuthProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
