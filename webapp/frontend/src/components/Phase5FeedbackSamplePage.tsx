'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Button, 
  VStack,
  HStack,
  Alert,
  Progress,
  CircularProgress,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  Spinner,
  DotsSpinner,
  PulseSpinner,
  LoadingOverlay,
  useToast,
  Section,
  Container
} from './ui';
import { 
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function Phase5FeedbackSamplePage() {
  const [alertVisible, setAlertVisible] = useState<Record<string, boolean>>({
    info: true,
    success: true,
    warning: true,
    error: true,
  });
  
  const [progressValue, setProgressValue] = useState(45);
  const [circularProgress, setCircularProgress] = useState(65);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [loadingOverlay, setLoadingOverlay] = useState(false);
  const { addToast } = useToast();

  const handleProgressChange = (increment: number) => {
    setProgressValue(prev => Math.max(0, Math.min(100, prev + increment)));
  };

  const handleCircularProgressChange = (increment: number) => {
    setCircularProgress(prev => Math.max(0, Math.min(100, prev + increment)));
  };

  const showToast = (variant: 'info' | 'success' | 'warning' | 'error') => {
    const messages = {
      info: 'これは情報メッセージです',
      success: '操作が正常に完了しました！',
      warning: '注意が必要です',
      error: 'エラーが発生しました',
    };

    addToast({
      variant,
      title: `${variant.toUpperCase()} Toast`,
      content: messages[variant],
      duration: 3000,
    });
  };

  const toggleLoadingOverlay = () => {
    setLoadingOverlay(true);
    setTimeout(() => setLoadingOverlay(false), 3000);
  };

  return (
    <Container size="xl">
      <VStack spacing="2xl">
        {/* Page Header */}
        <Section spacing="lg" background="none">
          <VStack spacing="md" align="center">
            <h1 className="text-3xl font-bold text-gray-300">
              Phase 5: フィードバック系コンポーネント
            </h1>
            <p className="text-lg text-gray-400 text-center max-w-2xl">
              ユーザーにフィードバックを提供するコンポーネントのデモンストレーション
            </p>
            <p className="text-sm text-gray-500">
              ※このページのボタンはデモ用で、実際の機能はありません
            </p>
          </VStack>
        </Section>

        {/* Alert Components */}
        <Section spacing="xl" background="darker" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Alert コンポーネント</h2>
            <p className="text-gray-400">重要な情報や状況をユーザーに伝えるためのアラートコンポーネント</p>
            
            <VStack spacing="md">
              {alertVisible.info && (
                <Alert
                  variant="info"
                  title="情報"
                  closable
                  onClose={() => setAlertVisible(prev => ({ ...prev, info: false }))}
                >
                  これは情報を伝えるアラートです。システムからの通知や説明に使用します。
                </Alert>
              )}
              
              {alertVisible.success && (
                <Alert
                  variant="success"
                  title="成功"
                  closable
                  onClose={() => setAlertVisible(prev => ({ ...prev, success: false }))}
                >
                  操作が正常に完了しました。変更内容が保存されています。
                </Alert>
              )}
              
              {alertVisible.warning && (
                <Alert
                  variant="warning"
                  title="警告"
                  closable
                  onClose={() => setAlertVisible(prev => ({ ...prev, warning: false }))}
                >
                  この操作を実行する前に、内容を確認してください。
                </Alert>
              )}
              
              {alertVisible.error && (
                <Alert
                  variant="error"
                  title="エラー"
                  closable
                  onClose={() => setAlertVisible(prev => ({ ...prev, error: false }))}
                >
                  エラーが発生しました。管理者にお問い合わせください。
                </Alert>
              )}
            </VStack>

            <Box>
              <h4 className="text-md font-medium text-gray-400 mb-3">カスタムアイコン</h4>
              <VStack spacing="sm">
                <Alert variant="info" icon={<InformationCircleIcon className="h-5 w-5" />}>
                  カスタムアイコンを使用したアラート
                </Alert>
                <Alert variant="success" icon={null}>
                  アイコンなしのアラート
                </Alert>
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Toast Components */}
        <Section spacing="xl" background="lighter" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Toast コンポーネント</h2>
            <p className="text-gray-400">一時的な通知を表示するポップアップコンポーネント</p>
            
            <Box className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="secondary" onClick={() => showToast('info')}>
                Info Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('success')}>
                Success Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('warning')}>
                Warning Toast
              </Button>
              <Button variant="secondary" onClick={() => showToast('error')}>
                Error Toast
              </Button>
            </Box>

            <Card variant="outlined" padding="md">
              <p className="text-sm text-gray-400">
                画面右上にToast通知が表示されます。3秒後に自動的に消えます。
              </p>
            </Card>
          </VStack>
        </Section>

        {/* Progress Components */}
        <Section spacing="xl" background="gradient" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Progress コンポーネント</h2>
            <p className="text-gray-400">進捗状況を視覚的に表示するコンポーネント</p>
            
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Linear Progress */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">線形プログレス</h3>
                
                <VStack spacing="md">
                  <Box>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">基本プログレス</h4>
                    <Progress value={progressValue} showLabel />
                  </Box>
                  
                  <HStack spacing="sm">
                    <Button size="sm" onClick={() => handleProgressChange(-10)}>-10</Button>
                    <Button size="sm" onClick={() => handleProgressChange(10)}>+10</Button>
                    <Button size="sm" onClick={() => setProgressValue(0)}>Reset</Button>
                  </HStack>
                </VStack>

                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">バリエーション</h4>
                  <Progress variant="success" value={75} showLabel label="成功" />
                  <Progress variant="warning" value={50} showLabel label="警告" />
                  <Progress variant="error" value={25} showLabel label="エラー" />
                  <Progress variant="gradient" value={60} showLabel label="グラデーション" striped />
                </VStack>

                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">サイズ</h4>
                  <Progress size="xs" value={40} />
                  <Progress size="sm" value={50} />
                  <Progress size="md" value={60} />
                  <Progress size="lg" value={70} />
                  <Progress size="xl" value={80} />
                </VStack>
              </VStack>

              {/* Circular Progress */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">円形プログレス</h3>
                
                <VStack spacing="md">
                  <CircularProgress value={circularProgress} showLabel size={120} />
                  
                  <HStack spacing="sm">
                    <Button size="sm" onClick={() => handleCircularProgressChange(-10)}>-10</Button>
                    <Button size="sm" onClick={() => handleCircularProgressChange(10)}>+10</Button>
                    <Button size="sm" onClick={() => setCircularProgress(0)}>Reset</Button>
                  </HStack>
                </VStack>

                <Box className="grid grid-cols-2 gap-4">
                  <VStack spacing="sm" align="center">
                    <CircularProgress variant="success" value={85} showLabel size={80} />
                    <span className="text-xs text-gray-400">成功</span>
                  </VStack>
                  <VStack spacing="sm" align="center">
                    <CircularProgress variant="warning" value={65} showLabel size={80} />
                    <span className="text-xs text-gray-400">警告</span>
                  </VStack>
                  <VStack spacing="sm" align="center">
                    <CircularProgress variant="error" value={35} showLabel size={80} />
                    <span className="text-xs text-gray-400">エラー</span>
                  </VStack>
                  <VStack spacing="sm" align="center">
                    <CircularProgress variant="gradient" value={90} showLabel size={80} />
                    <span className="text-xs text-gray-400">グラデーション</span>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Skeleton Components */}
        <Section spacing="xl" background="darker" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Skeleton コンポーネント</h2>
            <p className="text-gray-400">コンテンツの読み込み中を表現するプレースホルダー</p>
            
            <HStack spacing="md">
              <Button 
                variant={showSkeleton ? "primary" : "secondary"} 
                onClick={() => setShowSkeleton(!showSkeleton)}
              >
                {showSkeleton ? 'コンテンツを表示' : 'スケルトンを表示'}
              </Button>
            </HStack>

            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Skeletons */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">基本スケルトン</h3>
                
                {showSkeleton ? (
                  <VStack spacing="md">
                    <Skeleton variant="title" />
                    <SkeletonText lines={3} />
                    <Skeleton variant="button" width="150px" />
                    <Skeleton variant="image" />
                  </VStack>
                ) : (
                  <VStack spacing="md">
                    <h4 className="text-xl font-semibold">実際のコンテンツ</h4>
                    <p className="text-gray-400">
                      これは実際のコンテンツです。ページが読み込まれる前は、
                      スケルトンプレースホルダーが表示されます。
                      ユーザーエクスペリエンスを向上させるために重要です。
                    </p>
                    <Button>アクションボタン</Button>
                    <Box className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
                  </VStack>
                )}
              </VStack>

              {/* Complex Skeletons */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">複合スケルトン</h3>
                
                {showSkeleton ? (
                  <VStack spacing="md">
                    <SkeletonCard />
                    <SkeletonList items={3} />
                    <SkeletonTable rows={3} columns={3} />
                  </VStack>
                ) : (
                  <VStack spacing="md">
                    <Card variant="outlined" padding="md">
                      <VStack spacing="sm">
                        <HStack spacing="sm">
                          <Box className="w-10 h-10 bg-blue-500 rounded-full" />
                          <VStack spacing="xs" align="start">
                            <span className="font-medium">ユーザー名</span>
                            <span className="text-sm text-gray-400">@username</span>
                          </VStack>
                        </HStack>
                        <h4 className="font-semibold">カードタイトル</h4>
                        <p className="text-sm text-gray-400">カードの説明文</p>
                      </VStack>
                    </Card>
                    
                    <Box className="space-y-2">
                      {['項目 1', '項目 2', '項目 3'].map((item, index) => (
                        <HStack key={index} spacing="sm">
                          <Box className="w-8 h-8 bg-green-500 rounded-full" />
                          <span>{item}</span>
                        </HStack>
                      ))}
                    </Box>
                  </VStack>
                )}
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Spinner Components */}
        <Section spacing="xl" background="lighter" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Spinner コンポーネント</h2>
            <p className="text-gray-400">読み込み中やプロセス実行中を示すスピナー</p>
            
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Spinners */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">基本スピナー</h3>
                
                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">サイズ</h4>
                  <HStack spacing="md" align="center">
                    <Spinner size="xs" />
                    <Spinner size="sm" />
                    <Spinner size="md" />
                    <Spinner size="lg" />
                    <Spinner size="xl" />
                  </HStack>
                </VStack>

                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">カラー</h4>
                  <HStack spacing="md" align="center">
                    <Spinner variant="primary" />
                    <Spinner variant="success" />
                    <Spinner variant="warning" />
                    <Spinner variant="error" />
                    <Spinner variant="white" />
                  </HStack>
                </VStack>
              </VStack>

              {/* Dots Spinners */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">ドットスピナー</h3>
                
                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">サイズ</h4>
                  <VStack spacing="md" align="center">
                    <DotsSpinner size="sm" />
                    <DotsSpinner size="md" />
                    <DotsSpinner size="lg" />
                  </VStack>
                </VStack>

                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">カラー</h4>
                  <VStack spacing="md" align="center">
                    <DotsSpinner variant="primary" />
                    <DotsSpinner variant="success" />
                    <DotsSpinner variant="warning" />
                    <DotsSpinner variant="error" />
                  </VStack>
                </VStack>
              </VStack>

              {/* Pulse Spinners */}
              <VStack spacing="lg">
                <h3 className="text-lg font-medium text-gray-300">パルススピナー</h3>
                
                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">サイズ</h4>
                  <VStack spacing="md" align="center">
                    <PulseSpinner size="sm" />
                    <PulseSpinner size="md" />
                    <PulseSpinner size="lg" />
                  </VStack>
                </VStack>

                <VStack spacing="md">
                  <h4 className="text-sm font-medium text-gray-400">カラー</h4>
                  <VStack spacing="md" align="center">
                    <PulseSpinner variant="primary" />
                    <PulseSpinner variant="success" />
                    <PulseSpinner variant="warning" />
                  </VStack>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Loading Overlay */}
        <Section spacing="xl" background="gradient" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">Loading Overlay</h2>
            <p className="text-gray-400">コンテンツ全体をカバーするローディングオーバーレイ</p>
            
            <LoadingOverlay 
              visible={loadingOverlay} 
              message="処理中..." 
              spinner="pulse"
              size="lg"
            >
              <Card variant="outlined" padding="xl">
                <VStack spacing="lg" align="center">
                  <h3 className="text-xl font-semibold">オーバーレイテスト</h3>
                  <p className="text-gray-400 text-center">
                    ボタンをクリックすると、3秒間ローディングオーバーレイが表示されます。
                    この間、コンテンツは操作できなくなります。
                  </p>
                  <Button 
                    variant="primary" 
                    onClick={toggleLoadingOverlay}
                    disabled={loadingOverlay}
                  >
                    {loadingOverlay ? 'ローディング中...' : 'ローディング開始'}
                  </Button>
                </VStack>
              </Card>
            </LoadingOverlay>
          </VStack>
        </Section>

        {/* Integration Example */}
        <Section spacing="xl" background="darker" border="both">
          <VStack spacing="lg">
            <h2 className="text-2xl font-semibold text-gray-300">統合例</h2>
            <p className="text-gray-400">複数のフィードバックコンポーネントを組み合わせた実用例</p>
            
            <Card variant="gradient" padding="lg">
              <VStack spacing="lg">
                <HStack spacing="md" justify="between">
                  <h3 className="text-lg font-semibold">ファイルアップロード</h3>
                  <DotsSpinner variant="primary" />
                </HStack>
                
                <Progress 
                  variant="success" 
                  value={75} 
                  showLabel 
                  label="アップロード進行中..." 
                />
                
                <Alert variant="info" title="進行状況">
                  3/4 ファイルのアップロードが完了しました。
                </Alert>
                
                <HStack spacing="md">
                  <Button variant="primary">続行</Button>
                  <Button variant="secondary">キャンセル</Button>
                </HStack>
              </VStack>
            </Card>
          </VStack>
        </Section>
      </VStack>
    </Container>
  );
}