import { MetadataRoute } from 'next';

// TODO: ページリンク構造は今後変更される可能性があります
// 新しいページの追加や既存ページのパス変更時は以下を更新してください：
// 1. 実際のページ実装状況に合わせてURL追加/削除
// 2. changeFrequency と priority の適切な設定
// 3. lastModified の動的更新（将来的にはCMSやDBから取得）

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
    // TODO: 以下のページは実装後にsitemapに追加（パス構造は変更される可能性があります）
    // - /cards (カード一覧) → 将来的に /database/cards や /collection に変更の可能性
    // - /cards/search (カード検索) → /search/cards に統合される可能性
    // - /decks (デッキ一覧) → /builder/decks や /collection/decks に変更の可能性
    // - /decks/builder (デッキ構築) → /builder や /deck-builder に変更の可能性
    // - /search (統合検索) → /find や /query に変更の可能性
    // - /about (サイト情報) → /info や /project に変更の可能性
    // - /rules (ゲームルール) → /game/rules や /help/rules に変更の可能性
    // - /leaders (リーダー一覧) → /database/leaders や /game/leaders に変更の可能性
    // - /tribes (種族一覧) → /database/tribes や /game/tribes に変更の可能性
    // - /privacy (プライバシーポリシー) → /legal/privacy に変更の可能性
    // - /terms (利用規約) → /legal/terms に変更の可能性
    // - /help (ヘルプ) → /support や /faq に変更の可能性
    // - /guide (使い方ガイド) → /tutorial や /help/guide に変更の可能性
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