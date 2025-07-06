import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://methologia-oracle-admiral-ship-bridge.com';
  const lastModified = new Date();

  return [
    // トップページ（最高優先度）
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    // カード関連ページ
    {
      url: `${baseUrl}/cards`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cards/search`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // デッキ関連ページ
    {
      url: `${baseUrl}/decks`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/decks/builder`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // 検索ページ
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // 情報ページ
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/rules`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/leaders`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tribes`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    // ユーティリティページ
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // ヘルプ・ガイドページ
    {
      url: `${baseUrl}/help`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];
}

// 動的サイトマップ生成用のヘルパー関数（将来的な拡張用）
export async function generateDynamicSitemap(): Promise<MetadataRoute.Sitemap> {
  // const baseUrl = 'https://methologia-oracle-admiral-ship-bridge.com';
  // const lastModified = new Date();
  
  // 将来的にカードやデッキの個別ページが追加された際に使用
  // const cards = await fetchAllCards();
  // const cardSitemaps = cards.map(card => ({
  //   url: `${baseUrl}/cards/${card.id}`,
  //   lastModified: new Date(card.updatedAt),
  //   changeFrequency: 'monthly' as const,
  //   priority: 0.6,
  // }));

  return [
    // 静的ページ + 動的ページの組み合わせ
    // ...staticPages,
    // ...cardSitemaps,
  ];
}