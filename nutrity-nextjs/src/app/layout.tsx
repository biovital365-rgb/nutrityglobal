import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutrity.global';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Nutrity Global | Hábitos y salud metabólica",
  description: "Una ruta educativa para organizar hábitos, registrar avances y preparar mejores conversaciones con tu profesional.",
  keywords: ["salud metabólica", "hábitos", "nutrición", "bienestar", "BioVital.360", "seguimiento"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    title: "Nutrity Global | Hábitos y salud metabólica",
    description: "Tu próximo paso, claro y posible. Educación y acompañamiento para organizar hábitos sostenibles.",
    siteName: "Nutrity Global",
    images: [
      {
        url: `/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Nutrity Global",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutrity Global | Hábitos y salud metabólica",
    description: "Tu próximo paso, claro y posible. Educación y acompañamiento para organizar hábitos sostenibles.",
    images: [`/og-image.png`],
  },
  icons: { icon: "/brand/nutrity-symbol-micro.svg", apple: "/brand/nutrity-symbol.svg" },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Nutrity Global',
      description: 'Una ruta educativa para organizar hábitos y registrar avances.',
      publisher: {
        '@id': `${baseUrl}/#organization`
      },
      inLanguage: 'es-ES'
    },
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Nutrity Global',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/brand/nutrity-symbol.svg`
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="font-sans h-full antialiased"
    >
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col">{children}<AnalyticsConsent /></body>
    </html>
  );
}
