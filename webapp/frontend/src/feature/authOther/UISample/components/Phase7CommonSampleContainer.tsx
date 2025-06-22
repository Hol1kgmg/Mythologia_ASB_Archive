'use client';

import { BeakerIcon, ChartBarIcon, CubeIcon } from '@heroicons/react/24/outline';
import {
  BackgroundPattern,
  Box,
  Button,
  Card,
  Container,
  FeatureSection,
  FluidContainer,
  HeroSection,
  HStack,
  PageContainer,
  Section,
  VStack,
} from '../../../../components/ui';

export default function Phase7CommonSampleContainer() {
  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-4xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-zinc-200 mb-6">Phase 7: 共通・背景コンポーネント</h2>

      {/* Container Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Container</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">標準Container (max-width制限あり)</p>
            <Container>
              <Card padding="sm" variant="outlined">
                <p className="text-zinc-300">
                  標準Containerの内容です。レスポンシブなmax-width制限があります。
                </p>
              </Card>
            </Container>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">FluidContainer (幅100%)</p>
            <FluidContainer>
              <Card padding="sm" variant="outlined">
                <p className="text-zinc-300">
                  FluidContainerの内容です。画面幅いっぱいに広がります。
                </p>
              </Card>
            </FluidContainer>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">PageContainer (ページ全体用)</p>
            <PageContainer className="border border-zinc-600 rounded">
              <Card padding="sm" variant="outlined">
                <p className="text-zinc-300">
                  PageContainerの内容です。ページレイアウト全体に使用します。
                </p>
              </Card>
            </PageContainer>
          </Box>
        </Box>
      </Box>

      {/* Section Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Section</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">基本的なSection</p>
            <Section spacing="md" background="default">
              <p className="text-zinc-300">
                基本的なセクションです。適切なスペーシングとボーダーがあります。
              </p>
            </Section>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">HeroSection</p>
            <HeroSection
              title="神託のメソロギア"
              subtitle="非公式Webアプリケーション"
              description="カード情報データベースとデッキ構築をサポートするWebアプリケーションです。"
              actions={
                <HStack spacing="md">
                  <Button variant="primary" size="lg">
                    デッキを作成
                  </Button>
                  <Button variant="secondary" size="lg">
                    カードを探す
                  </Button>
                </HStack>
              }
            />
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">FeatureSection</p>
            <FeatureSection
              title="主要機能"
              description="アプリケーションの主要な機能をご紹介します"
            >
              <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Box className="text-center">
                  <CubeIcon className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                  <h4 className="font-medium text-zinc-200 mb-1">カード管理</h4>
                  <p className="text-sm text-zinc-400">全カード情報の検索・フィルタリング機能</p>
                </Box>
                <Box className="text-center">
                  <BeakerIcon className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                  <h4 className="font-medium text-zinc-200 mb-1">デッキ構築</h4>
                  <p className="text-sm text-zinc-400">戦略的なデッキ作成とシミュレーション</p>
                </Box>
                <Box className="text-center">
                  <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-zinc-300" />
                  <h4 className="font-medium text-zinc-200 mb-1">統計分析</h4>
                  <p className="text-sm text-zinc-400">デッキ性能の詳細な分析機能</p>
                </Box>
              </Box>
            </FeatureSection>
          </Box>
        </Box>
      </Box>

      {/* Layout Stack Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Stack Layout</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">VStack (縦方向レイアウト)</p>
            <VStack spacing="sm" className="border border-zinc-600 rounded p-3">
              <Card padding="sm" variant="filled" className="w-full">
                <p className="text-zinc-300">アイテム 1</p>
              </Card>
              <Card padding="sm" variant="filled" className="w-full">
                <p className="text-zinc-300">アイテム 2</p>
              </Card>
              <Card padding="sm" variant="filled" className="w-full">
                <p className="text-zinc-300">アイテム 3</p>
              </Card>
            </VStack>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">HStack (横方向レイアウト)</p>
            <HStack spacing="sm" className="border border-zinc-600 rounded p-3">
              <Card padding="sm" variant="filled" className="flex-1">
                <p className="text-zinc-300">アイテム A</p>
              </Card>
              <Card padding="sm" variant="filled" className="flex-1">
                <p className="text-zinc-300">アイテム B</p>
              </Card>
              <Card padding="sm" variant="filled" className="flex-1">
                <p className="text-zinc-300">アイテム C</p>
              </Card>
            </HStack>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">スペーシングバリエーション</p>
            <VStack spacing="xs" className="border border-zinc-600 rounded p-3">
              <p className="text-xs text-zinc-400">XS spacing</p>
              <div className="h-2 bg-zinc-600 rounded w-full"></div>
              <div className="h-2 bg-zinc-600 rounded w-full"></div>
            </VStack>
            <br />
            <VStack spacing="lg" className="border border-zinc-600 rounded p-3">
              <p className="text-xs text-zinc-400">LG spacing</p>
              <div className="h-2 bg-zinc-600 rounded w-full"></div>
              <div className="h-2 bg-zinc-600 rounded w-full"></div>
            </VStack>
          </Box>
        </Box>
      </Box>

      {/* Background Pattern */}
      <Box margin="none" padding="md" background="default" rounded="md">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Background Pattern</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">背景パターンコンポーネント</p>
            <Box className="relative h-32 border border-zinc-600 rounded overflow-hidden">
              <BackgroundPattern />
              <Box className="relative z-10 flex items-center justify-center h-full">
                <Card padding="md" variant="elevated">
                  <p className="text-zinc-300">背景パターンの上に配置されたコンテンツ</p>
                </Card>
              </Box>
            </Box>
          </Box>

          <Box className="text-xs text-zinc-400 p-3 bg-zinc-800 rounded">
            <p>
              <strong>使用方法:</strong>{' '}
              BackgroundPatternコンポーネントは、ページ全体の背景として使用されます。
            </p>
            <p>相対位置の親要素内に配置し、コンテンツには z-10 以上を設定してください。</p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
