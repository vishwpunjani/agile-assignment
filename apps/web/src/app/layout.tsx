import type { Metadata } from "next";
import "./globals.css";
import CompanyLogo from "@/components/CompanyLogo";

export const metadata: Metadata = {
  title: "AgileMind",
  description: "Company AI Assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          background: "rgba(249, 250, 251, 0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid #f3f4f6",
        }}>
          <CompanyLogo />
        </header>
        <div style={{ paddingTop: "64px" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
