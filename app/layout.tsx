import type { Metadata } from "next";
import "@/styles/globals.css";
import "@/styles/typography.css";
import "@/styles/layout.css";
import "@/styles/animations.css";

export const metadata: Metadata = {
  title: {
    template: "%s | TechByBrewski",
    default: "TechByBrewski — Custom Software & Firebase Solutions",
  },
  description:
    "TechByBrewski builds custom web applications, internal tools, and Firebase-powered systems for growing businesses.",
  metadataBase: new URL("https://techbybrewski.com"),
  openGraph: {
    siteName: "TechByBrewski",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
