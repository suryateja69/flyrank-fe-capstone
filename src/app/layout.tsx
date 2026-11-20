import type { Metadata } from "next";
import { Navigation } from "@/components/navigation";
import "@fontsource/geist/400.css";
import "@fontsource/geist/500.css";
import "@fontsource/geist/600.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "LeadDesk — thoughtful project discovery",
  description:
    "An AI-assisted discovery workspace that turns business inquiries into clear, explainable next steps.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <div className="app-shell">
          <Navigation />
          <main id="main" className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
