import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Funnel_Display, Geist_Mono, Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

const funnel = Funnel_Display({
  subsets: ["latin"],
  variable: "--font-funnel",
  display: "swap",
  weight: ["500", "600"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  weight: ["300", "400", "500"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#040506",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://voxagent.in"),
  title: {
    default: "Vox — Your chief of staff, on speed dial",
    template: "%s · Vox",
  },
  description:
    "The smartest person in the room is now one phone call away. Calendar, commitments, priorities—handled before you hang up.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vox — Your chief of staff, on speed dial",
    description:
      "The smartest person in the room is now one phone call away. Calendar, commitments, priorities—handled before you hang up.",
    url: "https://voxagent.in",
    siteName: "Vox",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/vox.svg",
        width: 800,
        height: 600,
        alt: "Vox Logo and Brand Wordmark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vox — Your chief of staff, on speed dial",
    description:
      "The smartest person in the room is now one phone call away. Calendar, commitments, priorities—handled before you hang up.",
    images: ["/vox.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: { icon: "/vox.svg" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://voxagent.in/#website",
      url: "https://voxagent.in",
      name: "Vox",
      description: "Voice-first assistant reachable by phone call or WhatsApp.",
      publisher: {
        "@id": "https://voxagent.in/#organization",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://voxagent.in/#application",
      name: "Vox",
      url: "https://voxagent.in",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Telephony, iOS, Android, Web",
      description:
        "Voice-first assistant reachable by phone call or WhatsApp. Vox keeps work moving after the conversation ends: creating tasks, updating calendars, scheduling reminders, and placing outbound follow-ups.",
      offers: {
        "@type": "Offer",
        price: "0.00",
        priceCurrency: "USD",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "dark",
        inter.variable,
        funnel.variable,
        geistMono.variable,
      )}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
