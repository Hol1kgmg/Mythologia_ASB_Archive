import React from 'react';

interface StructuredDataProps {
  type?: 'website' | 'webApplication' | 'organization' | 'all';
}

export default function StructuredData({ type = 'all' }: StructuredDataProps) {
  const baseUrl = 'https://methologia-oracle-admiral-ship-bridge.com';
  
  // WebSiteスキーマ
  const websiteSchema = {
    '@context': 'https://schema.org/',
    '@type': 'WebSite',
    name: '神託のメソロギア - 非公式ファンサイト',
    description: '神託のメソロギア（Mythologia）のカード情報データベースとデッキ構築をサポートする非公式Webアプリケーション',
    url: baseUrl,
    inLanguage: 'ja-JP',
    isAccessibleForFree: true,
    // 検索機能実装後に有効化
    // potentialAction: {
    //   '@type': 'SearchAction',
    //   target: `${baseUrl}/search?q={search_term_string}`,
    //   'query-input': 'required name=search_term_string'
    // },
    author: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    },
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    },
    keywords: [
      '神託のメソロギア',
      'Mythologia',
      'メソロギア',
      'カードゲーム',
      'TCG',
      'デッキ構築',
      'カードデータベース',
      '非公式',
      'ファンサイト'
    ]
  };

  // WebApplicationスキーマ
  const webApplicationSchema = {
    '@context': 'https://schema.org/',
    '@type': 'WebApplication',
    name: '神託のメソロギア - Admiral Ship Bridge',
    alternateName: 'Mythologia Admiral Ship Bridge',
    description: 'カード情報検索とデッキ構築ツール。神託のメソロギアの非公式ファンサイト',
    url: baseUrl,
    applicationCategory: 'Game',
    applicationSubCategory: 'Card Game Tool',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    permissions: 'none',
    installUrl: baseUrl,
    downloadUrl: baseUrl,
    softwareVersion: '1.0.0',
    releaseNotes: 'Initial release with card database and deck building features',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
      availability: 'https://schema.org/InStock',
      category: 'Free'
    },
    featureList: [
      'カード情報検索',
      'デッキ構築ツール',
      'カードデータベース閲覧',
      'レスポンシブデザイン'
    ],
    screenshot: `${baseUrl}/og-image.png`,
    author: {
      '@type': 'Organization',
      name: 'Mythologia Admiral Ship Bridge Community'
    }
  };

  // Organizationスキーマ
  const organizationSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Organization',
    '@id': `${baseUrl}#organization`,
    name: 'Mythologia Admiral Ship Bridge Community',
    alternateName: '神託のメソロギア Admiral Ship Bridge コミュニティ',
    description: '有志による神託のメソロギア非公式ファンサイト運営コミュニティ',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 200,
      height: 200
    },
    image: `${baseUrl}/og-image.png`,
    foundingDate: '2024',
    slogan: 'Admiral Ship Bridge - 神託の海を渡る提督たちの架け橋',
    sameAs: [
      'https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Community Support',
      url: 'https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/issues'
    },
    areaServed: {
      '@type': 'Country',
      name: 'Japan'
    },
    knowsLanguage: ['ja-JP', 'en-US'],
    nonprofitStatus: 'https://schema.org/Nonprofit',
    seeks: '神託のメソロギアファンコミュニティの発展と情報共有'
  };

  // BreadcrumbListスキーマ（トップページ用）
  const breadcrumbSchema = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'ホーム',
        item: baseUrl
      }
    ]
  };

  const renderSchema = (schema: object, key: string) => (
    <script
      key={key}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema, null, 0) }}
    />
  );

  return (
    <>
      {(type === 'all' || type === 'website') && renderSchema(websiteSchema, 'website')}
      {(type === 'all' || type === 'webApplication') && renderSchema(webApplicationSchema, 'webApplication')}
      {(type === 'all' || type === 'organization') && renderSchema(organizationSchema, 'organization')}
      {type === 'all' && renderSchema(breadcrumbSchema, 'breadcrumb')}
    </>
  );
}

// 個別スキーマ用のエクスポート
export const WebSiteSchema = () => <StructuredData type="website" />;
export const WebApplicationSchema = () => <StructuredData type="webApplication" />;
export const OrganizationSchema = () => <StructuredData type="organization" />;