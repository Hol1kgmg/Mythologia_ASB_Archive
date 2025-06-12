'use client';

import React from 'react';
import HomeButton from '../ui/feedback/HomeButton';
import { 
  Box, 
  PageContainer, 
  Container, 
  VStack, 
  Heading, 
  Text, 
  BackgroundPattern 
} from '../ui';

interface NotFoundPageProps {
  title?: string;
  message?: string;
  showHomeLink?: boolean;
  customActions?: React.ReactNode;
}

export default function NotFoundPage({
  title = "404",
  message = "ページが見つかりません",
  showHomeLink = true,
  customActions
}: NotFoundPageProps) {

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
          `
        }}
      />

      {/* メインコンテナ */}
      <Container className="relative z-10 min-h-screen flex items-center justify-center">
        <VStack spacing="2xl" align="center" className="text-center">
          {/* エラーコード */}
          <Heading 
            level="h1"
            className="text-8xl md:text-9xl font-bold tracking-wider text-zinc-200"
            aria-label={`エラーコード ${title}`}
          >
            {title}
          </Heading>
          
          {/* エラーメッセージ */}
          <Text 
            size="xl"
            color="muted"
            className="font-light tracking-wide"
            role="alert"
            aria-live="polite"
          >
            {message}
          </Text>

          {/* アクションエリア */}
          <VStack spacing="lg" className="mt-8">
            {/* ホームリンク */}
            {showHomeLink && (
              <HomeButton size="lg" variant="primary">
                ← ホームに戻る
              </HomeButton>
            )}

            {/* カスタムアクション */}
            {customActions && (
              <Box>
                {customActions}
              </Box>
            )}
          </VStack>
        </VStack>
      </Container>
    </PageContainer>
  );
}