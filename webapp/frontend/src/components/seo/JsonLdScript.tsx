'use client';

import { useEffect, useRef } from 'react';

interface JsonLdScriptProps {
  data: object;
  id: string;
}

export default function JsonLdScript({ data, id }: JsonLdScriptProps) {
  const hasInjected = useRef(false);

  useEffect(() => {
    // 重複実行を防ぐ
    if (hasInjected.current) return;
    
    // DOM完全ロード後に実行
    const injectScript = () => {
      const existingScript = document.getElementById(id);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data, null, 0);
      
      // headに追加するのが理想的だが、bodyでもSEO効果はある
      document.head.appendChild(script);
      hasInjected.current = true;
    };

    // DOMContentLoadedイベントまたは既にロード済みの場合は即実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectScript);
    } else {
      // 微小なディレイを入れてブラウザ拡張機能との競合を回避
      setTimeout(injectScript, 100);
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', injectScript);
      const scriptToRemove = document.getElementById(id);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [data, id]);

  // サーバーサイドでは何もレンダリングしない
  return null;
}

// 複数のJSON-LDスクリプトを管理するコンポーネント
export function JsonLdScripts() {
  const structuredData = {
    website: {
      '@context': 'https://schema.org/',
      '@type': 'WebSite',
      name: '神託のメソロギア - 非公式ファンサイト',
      description: '神託のメソロギア（Mythologia）のカード情報データベースとデッキ構築をサポートする非公式Webアプリケーション',
      url: 'https://methologia-oracle-admiral-ship-bridge.com',
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
      keywords: [
        '神託のメソロギア',
        'Mythologia',
        'メソロギア',
        'カードゲーム',
        'TCG',
        'デッキ構築',
        'カードデータベース',
        '非公式',
        'ファンサイト',
        'Admiral Ship Bridge'
      ]
    },
    webApplication: {
      '@context': 'https://schema.org/',
      '@type': 'WebApplication',
      name: '神託のメソロギア - Admiral Ship Bridge',
      description: 'カード情報検索とデッキ構築ツール。神託のメソロギアの非公式ファンサイト',
      url: 'https://methologia-oracle-admiral-ship-bridge.com',
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
      '@id': 'https://methologia-oracle-admiral-ship-bridge.com#organization',
      name: 'Mythologia Admiral Ship Bridge Community',
      alternateName: '神託のメソロギア Admiral Ship Bridge コミュニティ',
      description: '有志による神託のメソロギア非公式ファンサイト運営コミュニティ',
      url: 'https://methologia-oracle-admiral-ship-bridge.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://methologia-oracle-admiral-ship-bridge.com/logo.png',
        width: 512,
        height: 512
      },
      image: 'https://methologia-oracle-admiral-ship-bridge.com/og-image.png',
      foundingDate: '2024',
      slogan: 'Admiral Ship Bridge - 神託の海を渡る提督たちの架け橋',
      sameAs: ['https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Community Support',
        url: 'https://github.com/Hol1kgmg/Mythologia_AdmiralsShipBridge/issues'
      },
      areaServed: { '@type': 'Country', name: 'Japan' },
      knowsLanguage: ['ja-JP', 'en-US'],
      nonprofitStatus: 'https://schema.org/Nonprofit',
      seeks: '神託のメソロギアファンコミュニティの発展と情報共有'
    }
  };

  return (
    <>
      <JsonLdScript data={structuredData.website} id="website-schema" />
      <JsonLdScript data={structuredData.webApplication} id="webapplication-schema" />
      <JsonLdScript data={structuredData.organization} id="organization-schema" />
    </>
  );
}