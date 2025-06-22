'use client';

import React from 'react';
import { Box, Caption, Code, Heading, Label, Text } from '../../../../components/ui';

export default function Phase6TypographySampleContainer() {
  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-4xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-zinc-200 mb-6">
        Phase 6: タイポグラフィ系コンポーネント
      </h2>

      {/* Heading Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Headings</h3>

        <Box className="space-y-4">
          <Box className="space-y-3">
            <Heading level="h1">見出し レベル 1 (H1)</Heading>
            <Heading level="h2">見出し レベル 2 (H2)</Heading>
            <Heading level="h3">見出し レベル 3 (H3)</Heading>
            <Heading level="h4">見出し レベル 4 (H4)</Heading>
            <Heading level="h5">見出し レベル 5 (H5)</Heading>
            <Heading level="h6">見出し レベル 6 (H6)</Heading>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">サイズバリエーション</p>
            <Box className="space-y-2">
              <Heading level="h2" className="text-xs">
                XS サイズの見出し
              </Heading>
              <Heading level="h2" className="text-sm">
                Small サイズの見出し
              </Heading>
              <Heading level="h2" className="text-base">
                Medium サイズの見出し
              </Heading>
              <Heading level="h2" className="text-lg">
                Large サイズの見出し
              </Heading>
              <Heading level="h2" className="text-xl">
                XL サイズの見出し
              </Heading>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">ウェイトバリエーション</p>
            <Box className="space-y-2">
              <Heading level="h3" weight="normal">
                Normal ウェイトの見出し
              </Heading>
              <Heading level="h3" weight="medium">
                Medium ウェイトの見出し
              </Heading>
              <Heading level="h3" weight="semibold">
                Semibold ウェイトの見出し
              </Heading>
              <Heading level="h3" weight="bold">
                Bold ウェイトの見出し
              </Heading>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Text Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Text</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">サイズバリエーション</p>
            <Box className="space-y-2">
              <Text size="xs">XS サイズのテキスト - 小さな補足情報やキャプションに使用</Text>
              <Text size="sm">Small サイズのテキスト - 詳細情報や説明文に使用</Text>
              <Text size="base">Medium サイズのテキスト - 基本的な本文テキスト</Text>
              <Text size="lg">Large サイズのテキスト - 重要なメッセージや強調したい文章</Text>
              <Text size="xl">XL サイズのテキスト - ヒーローセクションやメインメッセージ</Text>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">ウェイトバリエーション</p>
            <Box className="space-y-2">
              <Text weight="normal">Normal ウェイトのテキスト</Text>
              <Text weight="medium">Medium ウェイトのテキスト</Text>
              <Text weight="semibold">Semibold ウェイトのテキスト</Text>
              <Text weight="bold">Bold ウェイトのテキスト</Text>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">カラーバリエーション</p>
            <Box className="space-y-2">
              <Text color="default">Default カラーのテキスト</Text>
              <Text color="muted">Muted カラーのテキスト</Text>
              <Text color="primary">Primary カラーのテキスト</Text>
              <Text color="success">Success カラーのテキスト</Text>
              <Text color="warning">Warning カラーのテキスト</Text>
              <Text color="error">Error カラーのテキスト</Text>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">組み合わせ例</p>
            <Box className="space-y-2">
              <Text size="lg" weight="bold" color="primary">
                大きくて太いプライマリカラーのテキスト
              </Text>
              <Text size="sm" color="muted">
                小さめで控えめなテキスト
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Label & Caption Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Labels & Captions</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">Label コンポーネント</p>
            <Box className="space-y-2">
              <Label>基本的なラベル</Label>
              <Label size="sm">Small サイズのラベル</Label>
              <Label size="lg">Large サイズのラベル</Label>
              <Label required>必須項目のラベル</Label>
              <Label disabled>無効化されたラベル</Label>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">Caption コンポーネント</p>
            <Box className="space-y-2">
              <Caption>基本的なキャプション</Caption>
              <Caption className="text-xs">Small サイズのキャプション</Caption>
              <Caption color="muted">控えめなキャプション</Caption>
              <Caption color="error">エラー用のキャプション</Caption>
            </Box>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">フォーム例</p>
            <Box className="space-y-3">
              <Box>
                <Label required>ユーザー名</Label>
                <Box className="mt-1 p-2 border border-zinc-500 rounded bg-zinc-700 text-zinc-200">
                  john.doe@example.com
                </Box>
                <Caption>アカウント作成時に設定されたユーザー名です</Caption>
              </Box>

              <Box>
                <Label>パスワード</Label>
                <Box className="mt-1 p-2 border border-red-500 rounded bg-zinc-700 text-zinc-200">
                  ••••••••
                </Box>
                <Caption color="error">パスワードは8文字以上で入力してください</Caption>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Code Component */}
      <Box margin="none" padding="md" background="default" rounded="md">
        <h3 className="text-lg font-semibold text-zinc-200 mb-4">Code</h3>

        <Box className="space-y-4">
          <Box>
            <p className="text-sm text-zinc-300 mb-2">インラインコード</p>
            <Text>
              このテキストには <Code>インラインコード</Code> が含まれています。
              変数名やメソッド名を表示する際に使用します。
            </Text>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">ブロックコード</p>
            <Code variant="block" language="typescript">
              {`function greetUser(name: string): string {
  return \`Hello, \${name}! Welcome to Mythologia.\`;
}

const message = greetUser("Admiral");
console.log(message);`}
            </Code>
          </Box>

          <Box>
            <p className="text-sm text-zinc-300 mb-2">サイズバリエーション</p>
            <Box className="space-y-2">
              <div>
                <Text size="sm">
                  Small: <Code className="text-xs">npm install</Code>
                </Text>
              </div>
              <div>
                <Text size="base">
                  Medium: <Code className="text-sm">{`git commit -m "update"`}</Code>
                </Text>
              </div>
              <div>
                <Text size="lg">
                  Large: <Code className="text-base">{`docker run -p 3000:3000`}</Code>
                </Text>
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
