import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutrity.global';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "Nutrity Global | Hábitos y salud metabólica",
  description: "Recuperando tu salud metabólica con ciencia, hábitos y esperanza. Programa integral de nutrición y bienestar.",
  keywords: ["salud metabólica", "hábitos", "nutrición", "bienestar", "BioVital.360", "seguimiento"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    title: "Nutrity Global | Hábitos y salud metabólica",
    description: "Recuperando tu salud metabólica con ciencia, hábitos y esperanza.",
    siteName: "Nutrity Global",
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Nutrity Global",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nutrity Global | Hábitos y salud metabólica",
    description: "Recuperando tu salud metabólica con ciencia, hábitos y esperanza.",
    images: [`/og-image.jpg`],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      url: baseUrl,
      name: 'Nutrity Global',
      description: 'Recuperando tu salud metabólica con ciencia, hábitos y esperanza.',
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
        url: `${baseUrl}/favicon.ico`
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
