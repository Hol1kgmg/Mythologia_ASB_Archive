'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  Button, 
  VStack,
  HStack,
  BackgroundPattern,
  Container,
  FluidContainer,
  PageContainer,
  Section,
  HeroSection,
  FeatureSection,
  Alert
} from '../../../../components/ui';
import { 
  SparklesIcon,
  CubeIcon,
  BeakerIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  CodeBracketIcon
} from '@heroicons/react/24/outline';

export default function Phase7CommonSampleContainer() {
  return (
    <Box className="relative min-h-screen">
      {/* Global Background Pattern Demo */}
      <BackgroundPattern />

      {/* Page Container Demo */}
      <PageContainer minHeight="none" withBackground={false}>
        <VStack spacing="none">
          {/* Hero Section */}
          <HeroSection
            title="神託のメソロギア"
            subtitle="背景デザインと共通コンポーネントのデモンストレーション"
            description="※このページのボタンはデモ用で、実際の機能はありません"
            spacing="2xl"
            background="none"
            actions={
              <HStack spacing="md">
                <Button variant="primary" size="lg">
                  はじめる
                </Button>
                <Button variant="secondary" size="lg">
                  詳細を見る
                </Button>
              </HStack>
            }
          />

          <Alert
            variant="warning"
            title="開発者向け機能"
            className="w-full max-w-6xl mx-auto my-8"
          >
            共通UIコンポーネントのサンプルページです
          </Alert>

          {/* Background Pattern Controls */}
          <Section spacing="lg" background="none" border="bottom">
            <Card variant="gradient" padding="lg">
              <VStack spacing="lg">
                <h3 className="text-lg font-semibold text-gray-300">BackgroundPattern コンポーネント</h3>
                <p className="text-sm text-gray-400">
                  固定の背景デザインを提供するシンプルなコンポーネント
                </p>
                
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="outlined" padding="md">
                    <VStack spacing="sm">
                      <h4 className="text-sm font-semibold text-white">背景構成</h4>
                      <ul className="text-xs text-gray-400 space-y-1">
                        <li>• 黒のグラデーション背景</li>
                        <li>• 固定位置（fixed）</li>
                        <li>• z-index: -50</li>
                        <li>• カスタマイズ不可</li>
                      </ul>
                    </VStack>
                  </Card>
                  
                  <Card variant="outlined" padding="md">
                    <VStack spacing="sm">
                      <h4 className="text-sm font-semibold text-white">使用方法</h4>
                      <Box className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded">
                        &lt;BackgroundPattern /&gt;
                      </Box>
                      <p className="text-xs text-gray-500 mt-2">
                        プロパティなしのシンプルな使用
                      </p>
                    </VStack>
                  </Card>
                </Box>
              </VStack>
            </Card>
          </Section>

          {/* Container Demos */}
          <Section spacing="xl" background="none" border="bottom">
            <VStack spacing="2xl">
              <Box>
                <h3 className="text-xl font-semibold text-gray-300 mb-6">Container コンポーネント</h3>
                
                <VStack spacing="lg">
                  {/* Standard Container */}
                  <Box>
                    <h4 className="text-md font-medium text-gray-400 mb-3">標準コンテナ（サイズ別）</h4>
                    <VStack spacing="md">
                      {(['sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
                        <Container key={size} size={size}>
                          <Card variant="outlined" padding="md">
                            <p className="text-sm text-gray-400">
                              Container size: {size} - Max width: {
                                size === 'sm' ? '640px' :
                                size === 'md' ? '768px' :
                                size === 'lg' ? '1024px' :
                                size === 'xl' ? '1280px' : '1536px'
                              }
                            </p>
                          </Card>
                        </Container>
                      ))}
                    </VStack>
                  </Box>

                  {/* Fluid Container */}
                  <Box>
                    <h4 className="text-md font-medium text-gray-400 mb-3">Fluid Container</h4>
                    <FluidContainer maxWidth="1200px">
                      <Card variant="filled" padding="md">
                        <p className="text-sm text-gray-400">
                          Fluid Container - カスタム最大幅: 1200px
                        </p>
                      </Card>
                    </FluidContainer>
                  </Box>

                  {/* Page Container */}
                  <Box>
                    <h4 className="text-md font-medium text-gray-400 mb-3">Page Container（背景パターン付き）</h4>
                    <Box className="relative h-64 rounded-lg overflow-hidden">
                      <PageContainer withBackground backgroundPattern="gradient" minHeight="none">
                        <Card variant="gradient" padding="lg">
                          <VStack spacing="md" align="center">
                            <SparklesIcon className="h-12 w-12 text-purple-400" />
                            <h5 className="text-lg font-semibold">Page Container</h5>
                            <p className="text-sm text-gray-400 text-center">
                              独自の背景パターンを持つページコンテナ
                            </p>
                          </VStack>
                        </Card>
                      </PageContainer>
                    </Box>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Section>

          {/* Section Variants */}
          <Section spacing="xl" background="none">
            <VStack spacing="2xl">
              <Box>
                <h3 className="text-xl font-semibold text-gray-300 mb-6">Section コンポーネント</h3>
                
                <VStack spacing="lg">
                  {/* Basic Sections */}
                  <Box>
                    <h4 className="text-md font-medium text-gray-400 mb-3">基本セクション（スペーシング別）</h4>
                    <VStack spacing="md">
                      {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((spacing) => (
                        <Section key={spacing} spacing={spacing} background="lighter" border="both">
                          <p className="text-sm text-gray-400 text-center">
                            Section spacing: {spacing}
                          </p>
                        </Section>
                      ))}
                    </VStack>
                  </Box>

                  {/* Background Variations */}
                  <Box>
                    <h4 className="text-md font-medium text-gray-400 mb-3">背景バリエーション</h4>
                    <VStack spacing="md">
                      {(['default', 'darker', 'lighter', 'gradient', 'gradientReverse'] as const).map((bg) => (
                        <Section key={bg} spacing="md" background={bg} border="both">
                          <p className="text-sm text-gray-300 text-center">
                            Background: {bg}
                          </p>
                        </Section>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Section>

          {/* Hero Section Examples */}
          <Box>
            <h3 className="text-xl font-semibold text-gray-300 px-4 py-6">HeroSection バリエーション</h3>
            
            <HeroSection
              title="背景画像付きヒーロー"
              subtitle="美しいグラデーションオーバーレイ効果"
              backgroundImage="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&q=80"
              overlay
              overlayOpacity={0.7}
              spacing="2xl"
              actions={
                <HStack spacing="md">
                  <Button variant="primary" size="lg">
                    <RocketLaunchIcon className="h-5 w-5 mr-2" />
                    今すぐ始める
                  </Button>
                  <Button variant="secondary" size="lg">
                    詳細情報
                  </Button>
                </HStack>
              }
            />

            <HeroSection
              title={
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  グラデーションタイトル
                </span>
              }
              subtitle="カスタムReactNodeを使用したタイトルとサブタイトル"
              background="gradient"
              spacing="xl"
            >
              <Box className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                <Card variant="elevated" padding="md">
                  <VStack spacing="sm" align="center">
                    <CubeIcon className="h-8 w-8 text-blue-400" />
                    <p className="text-sm">機能 1</p>
                  </VStack>
                </Card>
                <Card variant="elevated" padding="md">
                  <VStack spacing="sm" align="center">
                    <BeakerIcon className="h-8 w-8 text-green-400" />
                    <p className="text-sm">機能 2</p>
                  </VStack>
                </Card>
                <Card variant="elevated" padding="md">
                  <VStack spacing="sm" align="center">
                    <ChartBarIcon className="h-8 w-8 text-purple-400" />
                    <p className="text-sm">機能 3</p>
                  </VStack>
                </Card>
              </Box>
            </HeroSection>
          </Box>

          {/* Feature Section Examples */}
          <Section spacing="xl" background="none">
            <VStack spacing="2xl">
              <h3 className="text-xl font-semibold text-gray-300">FeatureSection バリエーション</h3>

              <FeatureSection
                title="中央揃えの機能セクション"
                description="デフォルトでは中央揃えで、読みやすいレイアウトを提供します"
                align="center"
                spacing="lg"
                background="darker"
                border="both"
              >
                <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} variant="outlined" padding="lg">
                      <VStack spacing="md" align="center">
                        <CodeBracketIcon className="h-12 w-12 text-blue-400" />
                        <h4 className="font-semibold">機能 {i}</h4>
                        <p className="text-sm text-gray-400 text-center">
                          この機能についての説明文がここに入ります
                        </p>
                      </VStack>
                    </Card>
                  ))}
                </Box>
              </FeatureSection>

              <FeatureSection
                title="左揃えの機能セクション"
                description="左揃えレイアウトは、より伝統的な読みやすさを提供します"
                align="left"
                spacing="lg"
                background="lighter"
              >
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card variant="filled" padding="lg">
                    <h4 className="font-semibold mb-2">詳細機能 1</h4>
                    <p className="text-sm text-gray-400">
                      より詳細な説明文をここに記載します。左揃えのレイアウトは長い文章に適しています。
                    </p>
                  </Card>
                  <Card variant="filled" padding="lg">
                    <h4 className="font-semibold mb-2">詳細機能 2</h4>
                    <p className="text-sm text-gray-400">
                      もう一つの機能についての説明です。必要に応じて複数の段落を含めることができます。
                    </p>
                  </Card>
                </Box>
              </FeatureSection>

              <FeatureSection
                title="右揃えの機能セクション"
                description="特殊なケースで使用される右揃えレイアウト"
                align="right"
                spacing="lg"
                background="gradient"
                withContainer={false}
              >
                <Container size="lg">
                  <Card variant="gradient" padding="xl">
                    <p className="text-sm text-gray-300">
                      コンテナを無効にして、カスタムコンテナを使用することもできます
                    </p>
                  </Card>
                </Container>
              </FeatureSection>
            </VStack>
          </Section>

          {/* Combined Example */}
          <Section spacing="2xl" background="none" border="top">
            <VStack spacing="xl">
              <h3 className="text-xl font-semibold text-gray-300 text-center">統合デモ</h3>
              
              <FeatureSection
                title="すべてのコンポーネントの組み合わせ"
                description="BackgroundPattern、Container、Sectionを組み合わせた例"
                align="center"
                spacing="lg"
              >
                <Container size="lg">
                  <Card variant="gradient" padding="xl">
                    <VStack spacing="lg" align="center">
                      <SparklesIcon className="h-16 w-16 text-purple-400" />
                      <h4 className="text-2xl font-bold">統合されたデザインシステム</h4>
                      <p className="text-gray-400 text-center max-w-2xl">
                        これらのコンポーネントを組み合わせることで、
                        一貫性のある美しいUIを簡単に構築できます。
                      </p>
                      <HStack spacing="md">
                        <Button variant="primary">開始する</Button>
                        <Button variant="secondary">ドキュメント</Button>
                      </HStack>
                    </VStack>
                  </Card>
                </Container>
              </FeatureSection>
            </VStack>
          </Section>
        </VStack>
      </PageContainer>
    </Box>
  );
}