import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://methologia-oracle-admiral-ship-bridge.com';
  const lastModified = new Date();

  return [
    // 実際に存在するページのみ
    
    // トップページ（最高優先度） - メンテナンス画面
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    
    // ダッシュボードページ（存在確認済み）
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    
    // 将来実装予定のページは実装後に追加
    // TODO: 以下のページは実装後にsitemapに追加
    // - /cards (カード一覧)
    // - /cards/search (カード検索)
    // - /decks (デッキ一覧)
    // - /decks/builder (デッキ構築)
    // - /search (統合検索)
    // - /about (サイト情報)
    // - /rules (ゲームルール)
    // - /leaders (リーダー一覧)
    // - /tribes (種族一覧)
    // - /privacy (プライバシーポリシー)
    // - /terms (利用規約)
    // - /help (ヘルプ)
    // - /guide (使い方ガイド)
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