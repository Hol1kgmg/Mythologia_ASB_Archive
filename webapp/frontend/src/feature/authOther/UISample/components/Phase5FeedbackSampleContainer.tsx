'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Alert,
  Progress,
  Spinner,
  useToast
} from '../../../../components/ui';

export default function Phase5FeedbackSampleContainer() {
  const [alertVisible, setAlertVisible] = useState<Record<string, boolean>>({
    info: true,
    success: true,
    warning: true,
    error: true,
  });
  
  const [progressValue, setProgressValue] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleProgressChange = (increment: number) => {
    setProgressValue(prev => Math.max(0, Math.min(100, prev + increment)));
  };

  const handleCloseAlert = (type: string) => {
    setAlertVisible(prev => ({ ...prev, [type]: false }));
  };

  const showToast = (variant: 'info' | 'success' | 'warning' | 'error') => {
    addToast({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      content: `これは${variant}タイプのトーストメッセージです。`,
      variant,
      duration: 3000,
    });
  };

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-4xl mx-auto my-8"
    >

      <h2 className="text-2xl font-bold text-zinc-200 mb-6">Phase 5: フィードバック系コンポーネント</h2>
      
      {/* Alert Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Alerts</h3>
        
        <Box className="space-y-4">
          {alertVisible.info && (
            <Alert
              variant="info"
              title="情報"
              closable
              onClose={() => handleCloseAlert('info')}
            >
              これは情報を伝えるアラートです。ユーザーに有用な情報を提供します。
            </Alert>
          )}
          
          {alertVisible.success && (
            <Alert
              variant="success"
              title="成功"
              closable
              onClose={() => handleCloseAlert('success')}
            >
              操作が正常に完了しました。データが正常に保存されました。
            </Alert>
          )}
          
          {alertVisible.warning && (
            <Alert
              variant="warning"
              title="警告"
              closable
              onClose={() => handleCloseAlert('warning')}
            >
              注意が必要な状況です。続行する前に確認してください。
            </Alert>
          )}
          
          {alertVisible.error && (
            <Alert
              variant="error"
              title="エラー"
              closable
              onClose={() => handleCloseAlert('error')}
            >
              エラーが発生しました。入力内容を確認して再試行してください。
            </Alert>
          )}
          
          <Box display="flex" className="gap-2 flex-wrap">
            <Button size="sm" onClick={() => setAlertVisible({ info: true, success: true, warning: true, error: true })}>
              すべて表示
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setAlertVisible({ info: false, success: false, warning: false, error: false })}>
              すべて非表示
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Progress Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Progress</h3>
        
        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">基本的なプログレスバー ({progressValue}%)</p>
            <Progress value={progressValue} className="mb-2" />
            <Box display="flex" className="gap-2">
              <Button size="sm" onClick={() => handleProgressChange(-10)}>-10%</Button>
              <Button size="sm" onClick={() => handleProgressChange(10)}>+10%</Button>
              <Button variant="ghost" size="sm" onClick={() => setProgressValue(0)}>リセット</Button>
            </Box>
          </Box>
          
          <Box>
            <p className="text-sm text-zinc-300 mb-2">サイズバリエーション</p>
            <Box className="space-y-2">
              <Progress value={25} size="sm" />
              <Progress value={50} size="md" />
              <Progress value={75} size="lg" />
            </Box>
          </Box>
          
          <Box>
            <p className="text-sm text-zinc-300 mb-2">カラーバリエーション</p>
            <Box className="space-y-2">
              <Progress value={60} variant="default" />
              <Progress value={60} variant="success" />
              <Progress value={60} variant="warning" />
              <Progress value={60} variant="error" />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Spinner & Loading Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Spinners & Loading</h3>
        
        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">基本的なスピナー</p>
            <Box display="flex" className="gap-4 items-center">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
            </Box>
          </Box>
          
          <Box>
            <p className="text-sm text-zinc-300 mb-2">カラーバリエーション</p>
            <Box display="flex" className="gap-4 items-center">
              <Spinner variant="default" />
              <Spinner variant="primary" />
              <Spinner variant="success" />
              <Spinner variant="warning" />
              <Spinner variant="error" />
            </Box>
          </Box>
          
          <Box>
            <p className="text-sm text-zinc-300 mb-2">ローディング状態のボタン</p>
            <Box display="flex" className="gap-2">
              <Button
                onClick={handleLoadingDemo}
                disabled={isLoading}
                leftIcon={isLoading ? <Spinner size="sm" /> : undefined}
              >
                {isLoading ? 'ローディング中...' : 'ローディング開始'}
              </Button>
              <Button
                variant="secondary"
                disabled={isLoading}
                rightIcon={isLoading ? <Spinner size="sm" /> : undefined}
              >
                {isLoading ? '処理中...' : 'サブアクション'}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Toast Components */}
      <Box margin="none" padding="md" background="default" rounded="md">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Toast Notifications</h3>
        
        <Box className="space-y-4">
          <p className="text-sm text-zinc-300">
            ボタンをクリックしてトーストメッセージを表示します。
          </p>
          
          <Box display="flex" className="gap-2 flex-wrap">
            <Button onClick={() => showToast('info')}>Info Toast</Button>
            <Button onClick={() => showToast('success')}>Success Toast</Button>
            <Button onClick={() => showToast('warning')}>Warning Toast</Button>
            <Button onClick={() => showToast('error')}>Error Toast</Button>
          </Box>
          
          <Box className="text-xs text-zinc-400 p-3 bg-zinc-800 rounded">
            <p><strong>注意:</strong> ToastProviderがページに含まれている場合のみ動作します。</p>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}