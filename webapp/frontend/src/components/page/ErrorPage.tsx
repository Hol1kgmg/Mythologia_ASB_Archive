'use client';

import { useEffect } from 'react';
import {
  BackgroundPattern,
  Box,
  Button,
  Card,
  Code,
  Container,
  Heading,
  HStack,
  PageContainer,
  Text,
  VStack,
} from '../ui';
import HomeButton from '../ui/feedback/HomeButton';

interface ErrorPageProps {
  title?: string;
  message?: string;
  subMessage?: string;
  error?: Error & { digest?: string };
  onRetry?: () => void;
  showRetryButton?: boolean;
  showHomeButton?: boolean;
  showErrorDetails?: boolean;
}

export default function ErrorPage({
  title = 'ERROR',
  message = '予期しないエラーが発生しました',
  subMessage = '申し訳ございませんが、一時的な問題が発生している可能性があります。',
  error,
  onRetry,
  showRetryButton = true,
  showHomeButton = true,
  showErrorDetails = true,
}: ErrorPageProps) {
  useEffect(() => {
    if (error) {
      console.error('Application Error:', error);
    }
  }, [error]);

  return (
    <PageContainer className="min-h-screen relative overflow-x-hidden">
      {/* 背景パターン */}
      <BackgroundPattern />

      {/* 追加の装飾的背景 */}
      <Box
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(138, 43, 226, 0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* メインコンテナ */}
      <Container className="relative z-10 min-h-screen flex items-center justify-center">
        <VStack spacing="xl" align="center" className="text-center max-w-2xl">
          {/* エラータイトル */}
          <Heading
            level="h1"
            className="text-8xl md:text-9xl font-bold tracking-wider text-red-500"
            aria-label={`エラー: ${title}`}
          >
            {title}
          </Heading>

          {/* エラーメッセージ */}
          <VStack spacing="sm">
            <Text
              size="xl"
              color="primary"
              className="font-light tracking-wide"
              role="alert"
              aria-live="polite"
            >
              {message}
            </Text>

            {subMessage && <Text color="muted">{subMessage}</Text>}
          </VStack>

          {/* アクションボタン */}
          <HStack spacing="md" className="mt-8">
            {/* 再試行ボタン */}
            {showRetryButton && onRetry && (
              <Button
                onClick={onRetry}
                variant="danger"
                size="lg"
                leftIcon={<span>🔄</span>}
                aria-label="ページを再試行"
              >
                再試行
              </Button>
            )}

            {/* ホームボタン */}
            {showHomeButton && (
              <HomeButton size="lg" variant="secondary">
                ← ホームに戻る
              </HomeButton>
            )}
          </HStack>

          {/* ステージング環境でのみエラー詳細を表示 */}
          {showErrorDetails && error && process.env.NEXT_PUBLIC_IS_STAGING === 'true' && (
            <Box className="w-full mt-8">
              <details>
                <summary className="cursor-pointer text-red-400 mb-3 font-semibold flex items-center gap-2">
                  <span>🐛</span>
                  <Text color="error">エラー詳細 (ステージング環境)</Text>
                </summary>
                <Card variant="outlined" padding="md" className="border-red-500/20 bg-zinc-900/50">
                  <Code variant="block" className="text-red-400 text-sm">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                  </Code>
                </Card>
              </details>
            </Box>
          )}
        </VStack>
      </Container>
    </PageContainer>
  );
}
