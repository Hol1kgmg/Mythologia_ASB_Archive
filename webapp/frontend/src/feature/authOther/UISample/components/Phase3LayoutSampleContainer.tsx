'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Grid,
  GridItem,
  HStack,
  Spacer,
  VStack,
} from '../../../../components/ui';

export default function Phase3LayoutSampleContainer() {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const cardItems = [
    {
      id: '1',
      title: 'カード1',
      content: 'これは基本的なカードです。',
      variant: 'default' as const,
    },
    {
      id: '2',
      title: 'カード2',
      content: 'これは影付きカードです。',
      variant: 'elevated' as const,
    },
    {
      id: '3',
      title: 'カード3',
      content: 'これはアウトラインカードです。',
      variant: 'outlined' as const,
    },
    {
      id: '4',
      title: 'カード4',
      content: 'これは塗りつぶしカードです。',
      variant: 'filled' as const,
    },
    {
      id: '5',
      title: 'カード5',
      content: 'これはグラデーションカードです。',
      variant: 'gradient' as const,
    },
  ];

  const gridItems = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    content: `グリッドアイテム ${i + 1}`,
  }));

  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-6xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-300 mb-6">
        Phase 3: レイアウト系コンポーネントデモ
      </h2>

      {/* Card Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Card</h3>

        <VStack spacing="lg">
          {/* Basic Cards */}
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">基本的なカード</h4>
            <Grid cols={3} gap="md">
              {cardItems.slice(0, 3).map((item) => (
                <Card
                  key={item.id}
                  variant={item.variant}
                  header={item.title}
                  hover="lift"
                  clickable
                  onClick={() => setSelectedCard(item.id)}
                  className={selectedCard === item.id ? 'ring-2 ring-blue-500' : ''}
                >
                  <p className="text-sm">{item.content}</p>
                </Card>
              ))}
            </Grid>
          </Box>

          {/* Interactive Cards */}
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">インタラクティブカード</h4>
            <Grid cols={2} gap="md">
              <Card
                variant="filled"
                hover="glow"
                clickable
                header="ホバーエフェクト付き"
                footer={
                  <HStack justify="end">
                    <Button size="sm" variant="secondary">
                      キャンセル
                    </Button>
                    <Button size="sm" variant="primary">
                      確認
                    </Button>
                  </HStack>
                }
              >
                <p className="text-sm mb-2">このカードはホバー時に光ります。</p>
                <p className="text-xs text-gray-400">フッターにはアクションボタンがあります。</p>
              </Card>

              <Card variant="gradient" hover="scale" clickable padding="lg">
                <VStack spacing="sm" align="center">
                  <h4 className="text-lg font-semibold">スケールエフェクト</h4>
                  <p className="text-sm text-center">ホバー時に少し拡大します</p>
                  <Button variant="primary" size="sm">
                    アクション
                  </Button>
                </VStack>
              </Card>
            </Grid>
          </Box>

          {/* Complex Card Layout */}
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">複雑なレイアウト</h4>
            <Card
              variant="elevated"
              padding="lg"
              header={
                <HStack justify="between" align="center">
                  <h4 className="text-lg font-semibold">ダッシュボード</h4>
                  <Button size="sm" variant="ghost">
                    設定
                  </Button>
                </HStack>
              }
            >
              <Grid cols={4} gap="md">
                <Card variant="filled" padding="sm">
                  <VStack spacing="xs" align="center">
                    <span className="text-2xl font-bold text-blue-400">1,234</span>
                    <span className="text-xs text-gray-400">総ユーザー数</span>
                  </VStack>
                </Card>
                <Card variant="filled" padding="sm">
                  <VStack spacing="xs" align="center">
                    <span className="text-2xl font-bold text-green-400">567</span>
                    <span className="text-xs text-gray-400">アクティブ</span>
                  </VStack>
                </Card>
                <Card variant="filled" padding="sm">
                  <VStack spacing="xs" align="center">
                    <span className="text-2xl font-bold text-yellow-400">89</span>
                    <span className="text-xs text-gray-400">新規登録</span>
                  </VStack>
                </Card>
                <Card variant="filled" padding="sm">
                  <VStack spacing="xs" align="center">
                    <span className="text-2xl font-bold text-red-400">12</span>
                    <span className="text-xs text-gray-400">エラー</span>
                  </VStack>
                </Card>
              </Grid>
            </Card>
          </Box>
        </VStack>
      </Box>

      {/* Grid Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Grid</h3>

        <VStack spacing="lg">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">基本的なグリッド</h4>
            <Grid cols={4} gap="sm">
              {gridItems.slice(0, 8).map((item) => (
                <Box
                  key={item.id}
                  padding="sm"
                  background="lighter"
                  rounded="md"
                  className="text-center text-sm"
                >
                  {item.content}
                </Box>
              ))}
            </Grid>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">レスポンシブグリッド</h4>
            <Grid responsive gap="md">
              {cardItems.map((item) => (
                <Card key={item.id} variant="outlined" padding="sm">
                  <h5 className="font-medium mb-2">{item.title}</h5>
                  <p className="text-xs">{item.content}</p>
                </Card>
              ))}
            </Grid>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">カスタムグリッドレイアウト</h4>
            <Grid cols={6} gap="sm">
              <GridItem colSpan={2} rowSpan={2}>
                <Card variant="gradient" padding="md" className="h-full">
                  <VStack spacing="sm" align="center" justify="center" className="h-full">
                    <span className="text-lg font-bold">メイン</span>
                    <span className="text-sm">2x2スパン</span>
                  </VStack>
                </Card>
              </GridItem>
              <GridItem colSpan={4}>
                <Card variant="filled" padding="sm">
                  <span className="text-sm">ヘッダー (4列スパン)</span>
                </Card>
              </GridItem>
              <GridItem colSpan={2}>
                <Card variant="outlined" padding="sm">
                  <span className="text-sm">サイド1</span>
                </Card>
              </GridItem>
              <GridItem colSpan={2}>
                <Card variant="outlined" padding="sm">
                  <span className="text-sm">サイド2</span>
                </Card>
              </GridItem>
              <GridItem colSpan={6}>
                <Card variant="filled" padding="sm">
                  <span className="text-sm">フッター (フル幅)</span>
                </Card>
              </GridItem>
            </Grid>
          </Box>
        </VStack>
      </Box>

      {/* Stack Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Stack</h3>

        <VStack spacing="lg">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">垂直スタック (VStack)</h4>
            <Card variant="outlined" padding="md">
              <VStack spacing="sm">
                <Box padding="sm" background="lighter" rounded="md" className="w-full text-center">
                  アイテム 1
                </Box>
                <Box padding="sm" background="lighter" rounded="md" className="w-full text-center">
                  アイテム 2
                </Box>
                <Box padding="sm" background="lighter" rounded="md" className="w-full text-center">
                  アイテム 3
                </Box>
              </VStack>
            </Card>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">水平スタック (HStack)</h4>
            <Card variant="outlined" padding="md">
              <HStack spacing="sm">
                <Box padding="sm" background="lighter" rounded="md" className="flex-1 text-center">
                  アイテム 1
                </Box>
                <Box padding="sm" background="lighter" rounded="md" className="flex-1 text-center">
                  アイテム 2
                </Box>
                <Box padding="sm" background="lighter" rounded="md" className="flex-1 text-center">
                  アイテム 3
                </Box>
              </HStack>
            </Card>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">スペーサー付きレイアウト</h4>
            <Card variant="outlined" padding="md">
              <HStack align="center">
                <Button variant="secondary" size="sm">
                  左ボタン
                </Button>
                <Spacer />
                <Box className="text-sm text-gray-400">中央テキスト</Box>
                <Spacer />
                <Button variant="primary" size="sm">
                  右ボタン
                </Button>
              </HStack>
            </Card>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">区切り線付きスタック</h4>
            <Card variant="outlined" padding="md">
              <HStack spacing="md" divider>
                <VStack spacing="xs" align="center">
                  <span className="text-lg font-bold">100</span>
                  <span className="text-xs text-gray-400">いいね</span>
                </VStack>
                <VStack spacing="xs" align="center">
                  <span className="text-lg font-bold">50</span>
                  <span className="text-xs text-gray-400">コメント</span>
                </VStack>
                <VStack spacing="xs" align="center">
                  <span className="text-lg font-bold">25</span>
                  <span className="text-xs text-gray-400">シェア</span>
                </VStack>
              </HStack>
            </Card>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">複雑なスタック組み合わせ</h4>
            <Card variant="gradient" padding="lg">
              <VStack spacing="md">
                <HStack justify="between" align="center">
                  <h4 className="text-lg font-semibold">プロファイル</h4>
                  <Button variant="ghost" size="sm">
                    編集
                  </Button>
                </HStack>

                <HStack spacing="md" align="start">
                  <Box className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex-shrink-0"></Box>
                  <VStack spacing="xs" align="start" className="flex-1">
                    <h5 className="font-semibold">ユーザー名</h5>
                    <p className="text-sm text-gray-400">software developer</p>
                    <HStack spacing="sm">
                      <span className="text-xs bg-blue-600 px-2 py-1 rounded">React</span>
                      <span className="text-xs bg-green-600 px-2 py-1 rounded">TypeScript</span>
                      <span className="text-xs bg-purple-600 px-2 py-1 rounded">Next.js</span>
                    </HStack>
                  </VStack>
                </HStack>

                <HStack justify="between" className="pt-4 border-t border-gray-700">
                  <VStack spacing="xs" align="center">
                    <span className="text-lg font-bold">1.2k</span>
                    <span className="text-xs text-gray-400">フォロワー</span>
                  </VStack>
                  <VStack spacing="xs" align="center">
                    <span className="text-lg font-bold">456</span>
                    <span className="text-xs text-gray-400">フォロー中</span>
                  </VStack>
                  <VStack spacing="xs" align="center">
                    <span className="text-lg font-bold">89</span>
                    <span className="text-xs text-gray-400">投稿</span>
                  </VStack>
                </HStack>
              </VStack>
            </Card>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}
