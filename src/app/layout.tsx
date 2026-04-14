import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { FaultyTerminalWrapper } from "@/components/FaultyTerminalWrapper";

const GA_MEASUREMENT_ID = "G-VCQFSDNWJN";

// GitHub Pages deploys to /our-links/ subpath in production
const BASE_PATH = process.env.NODE_ENV === "production" ? "/our-links" : "";

export const metadata: Metadata = {
  title: "Our Links - Open Session",
  description: "Design systems, AI advice, and insights from Fortune 500 veterans. Free resources, templates, and tools for designers and developers.",
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.svg`, type: "image/svg+xml" },
      { url: `${BASE_PATH}/favicon.png`, type: "image/png" },
    ],
  },
  metadataBase: new URL("https://opensesh.github.io/our-links"),
  openGraph: {
    title: "Link Portal - Open Session",
    description: "Design systems, AI advice, and insights from Fortune 500 veterans. Free resources, templates, and tools for designers and developers.",
    url: "https://opensesh.github.io/our-links",
    siteName: "Open Session",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Open Session Link Portal",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Link Portal - Open Session",
    description: "Design systems, AI advice, and insights from Fortune 500 veterans. Free resources, templates, and tools.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="antialiased">
        {/* Background layer - fixed, behind all content */}
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <FaultyTerminalWrapper
            tint="#FFFAEE"
            brightness={0.08}
            curvature={0.4}
            mouseReact={true}
            mouseStrength={1.5}
            scale={1.2}
            scanlineIntensity={0.5}
            noiseAmp={1}
            pageLoadAnimation={true}
          />
        </div>
        {/* Content layer - above background */}
        <div className="relative z-10">{children}</div>
      </body>
    </html>
  );
}
