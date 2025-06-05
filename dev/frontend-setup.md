# フロントエンド開発ガイド (Next.js + FSD)

このドキュメントでは、Next.js App RouterとFeature-Sliced Designアーキテクチャを使用したフロントエンド開発について詳しく説明します。

## Next.js App Router概要

[Next.js](https://nextjs.org/docs/app/getting-started/installation)の最新のApp Routerを使用します。

### 特徴
- **ファイルベースルーティング**: `app/`ディレクトリベースのルーティング
- **レイアウト**: 階層的なレイアウトシステム
- **サーバーコンポーネント**: デフォルトでSSR対応
- **ストリーミング**: Suspenseによる漸進的なページ読み込み
- **型安全なルーティング**: TypeScript統合による型安全なナビゲーション

## Feature-Sliced Design (FSD)

機能ベースの階層的アーキテクチャを採用します。

```
src/
├── app/                            # Next.js App Router
├── features/                       # 機能別モジュール
│   ├── deck-builder/              # デッキ構築機能
│   ├── card-browser/              # カード閲覧機能
│   └── auth/                      # 認証機能
├── shared/                        # 共有コード
│   ├── ui/                        # UIコンポーネント
│   ├── hooks/                     # カスタムフック
│   ├── utils/                     # ユーティリティ
│   └── api/                       # API通信
└── widgets/                       # ページレベルコンポーネント
```

## プロジェクト構造

```
webapp/frontend/
├── src/
│   ├── app/                        # App Router
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # ホームページ
│   │   ├── cards/                  # カード機能
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── decks/                  # デッキ機能
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── edit/
│   │   │           └── page.tsx
│   │   └── globals.css
│   ├── features/                   # 機能別モジュール
│   │   ├── deck-builder/
│   │   │   ├── api/
│   │   │   │   ├── use-decks.ts
│   │   │   │   └── use-create-deck.ts
│   │   │   ├── components/
│   │   │   │   ├── DeckForm.tsx
│   │   │   │   ├── DeckCard.tsx
│   │   │   │   └── DeckStats.tsx
│   │   │   ├── hooks/
│   │   │   │   └── use-deck-validation.ts
│   │   │   └── types/
│   │   │       └── deck.types.ts
│   │   ├── card-browser/
│   │   │   ├── api/
│   │   │   │   ├── use-cards.ts
│   │   │   │   └── use-card-filters.ts
│   │   │   ├── components/
│   │   │   │   ├── CardGrid.tsx
│   │   │   │   ├── CardFilters.tsx
│   │   │   │   └── CardModal.tsx
│   │   │   └── hooks/
│   │   │       └── use-card-search.ts
│   │   └── auth/
│   │       ├── components/
│   │       │   ├── LoginForm.tsx
│   │       │   └── AuthProvider.tsx
│   │       └── hooks/
│   │           └── use-auth.ts
│   ├── shared/                     # 共有コード
│   │   ├── ui/                     # UIコンポーネント
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── hooks/                  # 共通フック
│   │   │   ├── use-pagination.ts
│   │   │   └── use-local-storage.ts
│   │   ├── utils/                  # ユーティリティ
│   │   │   ├── format.ts
│   │   │   └── validation.ts
│   │   └── api/                    # API通信
│   │       ├── client.ts
│   │       └── types.ts
│   └── widgets/                    # ページレベルコンポーネント
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── public/                         # 静的アセット
│   ├── images/
│   └── icons/
├── next.config.js
├── tailwind.config.js
├── package.json
└── tsconfig.json
```

## 開発ベストプラクティス

### 1. App Routerページ実装

```typescript
// src/app/cards/page.tsx
import { Suspense } from 'react';
import { CardBrowser } from '@/features/card-browser/components/CardBrowser';
import { CardFilters } from '@/features/card-browser/components/CardFilters';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

export default function CardsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">カード検索</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Suspense fallback={<LoadingSpinner />}>
            <CardFilters />
          </Suspense>
        </aside>
        
        <main className="lg:col-span-3">
          <Suspense fallback={<LoadingSpinner />}>
            <CardBrowser searchParams={searchParams} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

// メタデータ
export const metadata = {
  title: 'カード検索 | Mythologia Admiral Ship Bridge',
  description: '神託のメソロギアのカード情報を検索・フィルタリング',
};
```

### 2. レイアウト実装

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider } from '@/shared/providers/QueryProvider';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { Header } from '@/widgets/Header';
import { Footer } from '@/widgets/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mythologia Admiral Ship Bridge',
  description: '神託のメソロギア 非公式ファンサイト',
  keywords: ['神託のメソロギア', 'カードゲーム', 'デッキ構築'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 3. 機能コンポーネント実装

```typescript
// src/features/card-browser/components/CardBrowser.tsx
'use client';

import { useState } from 'react';
import { useCards } from '../api/use-cards';
import { CardGrid } from './CardGrid';
import { CardModal } from './CardModal';
import { Pagination } from '@/shared/ui/Pagination';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import type { CardDto } from '@mythologia/shared/types';

interface CardBrowserProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export function CardBrowser({ searchParams }: CardBrowserProps) {
  const [selectedCard, setSelectedCard] = useState<CardDto | null>(null);
  
  // URL パラメータから検索条件を構築
  const filters = {
    page: Number(searchParams.page) || 1,
    limit: Number(searchParams.limit) || 20,
    leaderId: searchParams.leaderId ? Number(searchParams.leaderId) : undefined,
    tribeId: searchParams.tribeId ? Number(searchParams.tribeId) : undefined,
    rarityId: searchParams.rarityId ? Number(searchParams.rarityId) : undefined,
    search: typeof searchParams.search === 'string' ? searchParams.search : undefined,
  };

  const { data, isLoading, error } = useCards(filters);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>カードの読み込みに失敗しました</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          再試行
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 検索結果サマリー */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          {data?.pagination.total || 0}件のカードが見つかりました
        </p>
      </div>

      {/* カードグリッド */}
      <CardGrid 
        cards={data?.cards || []}
        onCardClick={setSelectedCard}
      />

      {/* ページネーション */}
      {data?.pagination && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.totalPages}
          hasNext={data.pagination.hasNext}
          hasPrev={data.pagination.hasPrev}
        />
      )}

      {/* カード詳細モーダル */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
}
```

### 4. カスタムフック実装

```typescript
// src/features/card-browser/api/use-cards.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api/client';
import type { ApiResponse, CardListDto } from '@mythologia/shared/types';

export interface UseCardsParams {
  page?: number;
  limit?: number;
  leaderId?: number;
  tribeId?: number;
  rarityId?: number;
  costMin?: number;
  costMax?: number;
  search?: string;
}

export function useCards(params: UseCardsParams) {
  return useQuery({
    queryKey: ['cards', params],
    queryFn: async (): Promise<CardListDto> => {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const response = await api.get<ApiResponse<CardListDto>>(
        `/api/cards?${searchParams.toString()}`
      );
      
      if (!response.success) {
        throw new Error(response.error?.message || 'カード取得に失敗しました');
      }
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000,  // 5分間キャッシュ
    gcTime: 30 * 60 * 1000,   // 30分間メモリ保持
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
```

### 5. 状態管理（Jotai）

```typescript
// src/shared/store/deck-store.ts
import { atom } from 'jotai';
import type { DeckDto, CardDto } from '@mythologia/shared/types';

// デッキ編集状態
export const currentDeckAtom = atom<DeckDto | null>(null);

// デッキ内のカード
export const deckCardsAtom = atom<CardDto[]>([]);

// デッキの統計情報
export const deckStatsAtom = atom((get) => {
  const cards = get(deckCardsAtom);
  
  return {
    totalCards: cards.length,
    averageCost: cards.length > 0 
      ? cards.reduce((sum, card) => sum + card.cost, 0) / cards.length 
      : 0,
    costDistribution: cards.reduce((dist, card) => {
      dist[card.cost] = (dist[card.cost] || 0) + 1;
      return dist;
    }, {} as Record<number, number>),
  };
});

// デッキにカードを追加
export const addCardToDeckAtom = atom(
  null,
  (get, set, card: CardDto) => {
    const currentCards = get(deckCardsAtom);
    const cardCount = currentCards.filter(c => c.id === card.id).length;
    
    // 同じカードは最大3枚まで
    if (cardCount < 3) {
      set(deckCardsAtom, [...currentCards, card]);
    }
  }
);

// デッキからカードを削除
export const removeCardFromDeckAtom = atom(
  null,
  (get, set, cardId: string) => {
    const currentCards = get(deckCardsAtom);
    const cardIndex = currentCards.findIndex(card => card.id === cardId);
    
    if (cardIndex !== -1) {
      const newCards = [...currentCards];
      newCards.splice(cardIndex, 1);
      set(deckCardsAtom, newCards);
    }
  }
);
```

### 6. フォーム管理（React Hook Form + Zod）

```typescript
// src/features/deck-builder/components/DeckForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createDeckInputSchema, type CreateDeckInput } from '@mythologia/shared/schemas';
import { LEADER_IDS } from '@mythologia/shared/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/shared/api/client';

export function DeckForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const form = useForm<CreateDeckInput>({
    resolver: zodResolver(createDeckInputSchema),
    defaultValues: {
      name: '',
      leaderId: LEADER_IDS.DRAGON,
      cardIds: [],
    },
  });

  const createDeckMutation = useMutation({
    mutationFn: async (data: CreateDeckInput) => {
      const response = await api.post('/api/decks', data);
      if (!response.success) {
        throw new Error(response.error?.message || 'デッキ作成に失敗しました');
      }
      return response.data;
    },
    onSuccess: (deck) => {
      // キャッシュ更新
      queryClient.invalidateQueries({ queryKey: ['decks'] });
      
      // 成功通知
      alert(`デッキ「${deck.name}」を作成しました`);
      
      // 詳細ページに遷移
      router.push(`/decks/${deck.id}`);
    },
    onError: (error) => {
      if (error.response?.data?.error?.code === 'VALIDATION_ERROR') {
        // バックエンドからの詳細エラーをフォームに反映
        const details = error.response.data.error.details;
        Object.entries(details || {}).forEach(([field, messages]) => {
          form.setError(field as keyof CreateDeckInput, {
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      } else {
        alert(error.message || 'デッキ作成に失敗しました');
      }
    },
  });

  const onSubmit = async (data: CreateDeckInput) => {
    await createDeckMutation.mutateAsync(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* デッキ名入力 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          デッキ名
        </label>
        <input
          {...form.register('name')}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="デッキ名を入力"
        />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      {/* リーダー選択 */}
      <div>
        <label className="block text-sm font-medium mb-2">
          リーダー
        </label>
        <select
          {...form.register('leaderId', { valueAsNumber: true })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {Object.entries(LEADER_IDS).map(([name, id]) => (
            <option key={id} value={id}>
              {name.charAt(0) + name.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={createDeckMutation.isPending}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {createDeckMutation.isPending ? 'デッキ作成中...' : 'デッキを作成'}
      </button>
    </form>
  );
}
```

### 7. 共有UIコンポーネント

```typescript
// src/shared/ui/Card.tsx
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  className, 
  variant = 'default',
  padding = 'medium' 
}: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border bg-card text-card-foreground',
        {
          'border-border': variant === 'default',
          'border-border shadow-lg': variant === 'elevated',
          'border-2 border-border': variant === 'outlined',
          'p-0': padding === 'none',
          'p-3': padding === 'small',
          'p-6': padding === 'medium',
          'p-8': padding === 'large',
        },
        className
      )}
    >
      {children}
    </div>
  );
}

// src/shared/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading, children, ...props }, ref) => {
    return (
      <button
        className={clsx(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          {
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'default',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90': variant === 'destructive',
            'border border-input hover:bg-accent hover:text-accent-foreground': variant === 'outline',
            'bg-secondary text-secondary-foreground hover:bg-secondary/80': variant === 'secondary',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'h-10 py-2 px-4': size === 'default',
            'h-9 px-3 rounded-md': size === 'sm',
            'h-11 px-8 rounded-md': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && (
          <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

## プロバイダー設定

### 1. TanStack Query設定

```typescript
// src/shared/providers/QueryProvider.tsx
'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1分
            gcTime: 5 * 60 * 1000, // 5分
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

## パフォーマンス最適化

### 1. 画像最適化

```typescript
// src/shared/ui/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className 
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        className={`duration-700 ease-in-out ${
          isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'
        }`}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
```

### 2. コード分割

```typescript
// src/features/deck-builder/components/DeckBuilder.tsx
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';

// 重いコンポーネントを遅延読み込み
const DeckEditor = lazy(() => import('./DeckEditor'));
const CardSelector = lazy(() => import('./CardSelector'));

export function DeckBuilder() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Suspense fallback={<LoadingSpinner />}>
        <DeckEditor />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CardSelector />
      </Suspense>
    </div>
  );
}
```

## テスト戦略

### 1. コンポーネントテスト

```typescript
// src/features/card-browser/components/__tests__/CardGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { CardGrid } from '../CardGrid';

const mockCards = [
  {
    id: '1',
    name: 'テストカード',
    cost: 3,
    power: 5,
    // ... other properties
  },
];

describe('CardGrid', () => {
  it('renders cards correctly', () => {
    const onCardClick = vi.fn();
    
    render(<CardGrid cards={mockCards} onCardClick={onCardClick} />);
    
    expect(screen.getByText('テストカード')).toBeInTheDocument();
    expect(screen.getByText('3コスト')).toBeInTheDocument();
    expect(screen.getByText('5パワー')).toBeInTheDocument();
  });
});
```

### 2. フック単体テスト

```typescript
// src/features/card-browser/api/__tests__/use-cards.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { useCards } from '../use-cards';

// API モック
vi.mock('@/shared/api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('useCards', () => {
  it('fetches cards successfully', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCards({ page: 1 }), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## デプロイメント

### 1. ビルド最適化

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    domains: ['images.example.com'],
  },
  // プロダクション最適化
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // バンドル分析
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      };
    }
    return config;
  },
}

module.exports = nextConfig
```

### 2. Vercelデプロイ

```bash
# Vercelにデプロイ
npx vercel

# 環境変数設定
vercel env add NEXT_PUBLIC_API_URL
vercel env add NEXTAUTH_SECRET
```

この設計により、保守性が高く、パフォーマンスに優れたモダンなフロントエンドアプリケーションを構築できます。