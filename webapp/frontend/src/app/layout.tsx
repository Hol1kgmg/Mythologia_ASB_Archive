import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// TODO: サイト設定は今後変更される可能性があります
// 以下の項目は実装状況に合わせて更新してください：
// 1. url - ドメイン変更時（本番・ステージング環境対応）
// 2. ogImage, twitterImage - 画像ファイルのパス変更時
// 3. description - 実装される機能に合わせて詳細化
// 4. keywords - SEO戦略に合わせて調整
// 5. verification.google - Google Search Console設定時

// サイトの基本情報
const siteConfig = {
  name: "神託のメソロギア - 非公式ファンサイト",
  title: "神託のメソロギア - Admiral Ship Bridge",
  description: "神託のメソロギア（Mythologia）のカード情報データベースとデッキ構築をサポートする非公式Webアプリケーション。カード検索、デッキ構築ツールを提供します。",
  url: "https://methologia-oracle-admiral-ship-bridge.com", // TODO: 環境別URL対応
  ogImage: "https://methologia-oracle-admiral-ship-bridge.com/og-image.png", // TODO: 画像作成・配置後にパス更新
  twitterImage: "https://methologia-oracle-admiral-ship-bridge.com/twitter-image.png", // TODO: 画像作成・配置後にパス更新
  // TODO: キーワードは実装機能・SEO戦略に合わせて調整
  keywords: [
    "神託のメソロギア",      // コアキーワード
    "Mythologia",         // 英語表記
    "メソロギア",          // 略称
    "カードゲーム",        // ジャンル
    "TCG",               // Trading Card Game
    "デッキ構築",          // 主要機能
    "カードデータベース",   // 主要機能
    "非公式",             // 重要：公式との区別
    "ファンサイト",        // カテゴリ
    "Admiral Ship Bridge" // サイト名
    // TODO: 実装後に追加予定のキーワード
    // "カード検索", "デッキシミュレーター", "戦略ガイド", 
    // "リーダー", "種族", "コンボ", "メタ", "攻略"
  ]
};

// JSON-LD構造化データ
const structuredData = {
  website: {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: '神託のメソロギア - 非公式ファンサイト',
    description: '神託のメソロギア（Mythologia）のカード情報データベースとデッキ構築をサポートする非公式Webアプリケーション',
    url: siteConfig.url,
    inLanguage: 'ja-JP',
    isAccessibleForFree: true,
    author: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    },
    keywords: siteConfig.keywords
  },
  webApplication: {
    '@context': 'https://schema.org/',
    '@type': 'WebApplication',
    name: '神託のメソロギア - Admiral Ship Bridge',
    description: 'カード情報検索とデッキ構築ツール。神託のメソロギアの非公式ファンサイト',
    url: siteConfig.url,
    applicationCategory: 'Game',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY'
    },
    featureList: [
      'カード情報検索',
      'デッキ構築ツール',
      'カードデータベース閲覧',
      'レスポンシブデザイン'
    ]
  },
  organization: {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    '@id': `${siteConfig.url}#organization`,
    name: 'Mythologia Admiral Ship Bridge Community',
    description: '有志による神託のメソロギア非公式ファンサイト運営コミュニティ',
    url: siteConfig.url,
    sameAs: ['https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge'],
    areaServed: { '@type': 'Country', name: 'Japan' }
  }
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
  // TODO: 検索エンジン検証コードは実際の設定時に更新
  verification: {
    google: 'verification-code-here', // TODO: Google Search Console設定時に実際のコードに変更
    // other: {
    //   'msvalidate.01': 'bing-verification-code-here', // TODO: Bing Webmaster Tools設定時
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* JSON-LD構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.website) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webApplication) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.organization) }}
        />
        {children}
      </body>
    </html>
  );
}
