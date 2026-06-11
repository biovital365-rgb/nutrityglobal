import type { Metadata } from "next";
import "./globals.css";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://nutrity.global';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "BioVital.360 | Remisión Metabólica",
  description: "Recuperando tu salud metabólica con ciencia, hábitos y esperanza. Programa integral de nutrición y bienestar.",
  keywords: ["remisión metabólica", "salud metabólica", "nutrición", "bienestar", "BioVital 360", "dieta antiinflamatoria", "salud integral"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: baseUrl,
    title: "BioVital.360 | Remisión Metabólica",
    description: "Recuperando tu salud metabólica con ciencia, hábitos y esperanza.",
    siteName: "BioVital 360",
    images: [
      {
        url: `/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "BioVital 360 Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BioVital.360 | Remisión Metabólica",
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
      name: 'BioVital 360',
      description: 'Recuperando tu salud metabólica con ciencia, hábitos y esperanza.',
      publisher: {
        '@id': `${baseUrl}/#organization`
      },
      inLanguage: 'es-ES'
    },
    {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'BioVital 360',
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
