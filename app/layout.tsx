import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import "@/styles/typography.css";
import "@/styles/layout.css";
import "@/styles/animations.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | TechByBrewski",
    default: "TechByBrewski — Custom Software & Automation",
  },
  description:
    "Custom web applications, dashboards, and automation systems built by TechByBrewski.",
  metadataBase: new URL("https://techbybrewski.com"),
  openGraph: {
    siteName: "TechByBrewski",
    type: "website",
    locale: "en_US",
    title: "TechByBrewski — Custom Software & Automation",
    description: "Custom web applications, dashboards, and automation systems built by TechByBrewski.",
    url: "https://techbybrewski.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "TechByBrewski" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TechByBrewski — Custom Software & Automation",
    description: "Custom web applications, dashboards, and automation systems built by TechByBrewski.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jakartaSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
