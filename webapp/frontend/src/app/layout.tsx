import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "../components/seo/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// サイトの基本情報
const siteConfig = {
  name: "神託のメソロギア - 非公式ファンサイト",
  title: "神託のメソロギア - Admiral Ship Bridge",
  description: "神託のメソロギア（Mythologia）のカード情報データベースとデッキ構築をサポートする非公式Webアプリケーション。カード検索、デッキ構築ツールを提供します。",
  url: "https://methologia-oracle-admiral-ship-bridge.com",
  ogImage: "https://methologia-oracle-admiral-ship-bridge.com/og-image.png",
  twitterImage: "https://methologia-oracle-admiral-ship-bridge.com/twitter-image.png",
  keywords: [
    "神託のメソロギア",
    "Mythologia",
    "メソロギア",
    "カードゲーム", 
    "TCG",
    "デッキ構築",
    "カードデータベース",
    "非公式",
    "ファンサイト",
    "Admiral Ship Bridge"
  ]
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: "Mythologia Admiral Ship Bridge Community",
      url: "https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge"
    }
  ],
  creator: "Mythologia Admiral Ship Bridge Community",
  publisher: "Mythologia Admiral Ship Bridge Community",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteConfig.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.twitterImage],
    creator: '@mythologia_asb',
  },
  verification: {
    google: 'verification-code-here', // Google Search Console用
    // other: {
    //   'msvalidate.01': 'bing-verification-code-here', // Bing用
    // },
  },
  category: 'Gaming',
  classification: 'Fan Site',
  referrer: 'origin-when-cross-origin',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <StructuredData />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
