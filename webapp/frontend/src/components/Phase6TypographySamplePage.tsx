'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Button, 
  VStack,
  HStack,
  Section,
  Container,
  Input,
  Heading,
  H1, H2, H3, H4, H5, H6,
  Text,
  Paragraph,
  Strong,
  Em,
  Small,
  Mark,
  Label,
  BadgeLabel,
  IconLabel,
  Caption,
  FigureWithCaption,
  ImageCaption,
  HelpCaption,
  Code,
  InlineCode,
  CodeBlock,
  Kbd,
  Var
} from './ui';
import { 
  StarIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function Phase6TypographySamplePage() {
  const [headingVariant, setHeadingVariant] = useState<'default' | 'gradient' | 'primary' | 'secondary' | 'muted'>('default');
  const [textSize, setTextSize] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'>('base');
  
  const sampleCode = `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

console.log(greet('Mythologia'));`;

  return (
    <Container size="xl">
      <VStack spacing="2xl">
        {/* Page Header */}
        <Section spacing="lg" background="none">
          <VStack spacing="md" align="center">
            <H1 variant="gradient">
              Phase 6: タイポグラフィ系コンポーネント
            </H1>
            <Text size="lg" variant="secondary" align="center">
              テキスト表示と装飾のためのコンポーネントのデモンストレーション
            </Text>
            <Caption align="center">
              ※このページのボタンはデモ用で、実際の機能はありません
            </Caption>
          </VStack>
        </Section>

        {/* Heading Components */}
        <Section spacing="xl" background="darker" border="both">
          <VStack spacing="lg">
            <H2>Heading コンポーネント</H2>
            <Text variant="secondary">
              見出しレベルとスタイルバリエーション
            </Text>
            
            <VStack spacing="lg">
              <Box>
                <Label>バリアント選択</Label>
                <HStack spacing="sm" className="mt-2">
                  {(['default', 'gradient', 'primary', 'secondary', 'muted'] as const).map((variant) => (
                    <Button
                      key={variant}
                      variant={headingVariant === variant ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setHeadingVariant(variant)}
                    >
                      {variant}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <VStack spacing="md">
                <H1 variant={headingVariant}>H1: 神託のメソロギア</H1>
                <H2 variant={headingVariant}>H2: カードバトルゲーム</H2>
                <H3 variant={headingVariant}>H3: デッキ構築システム</H3>
                <H4 variant={headingVariant}>H4: 戦略的なプレイ</H4>
                <H5 variant={headingVariant}>H5: 豊富なカード種類</H5>
                <H6 variant={headingVariant}>H6: オンライン対戦対応</H6>
              </VStack>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="outlined" padding="md">
                  <VStack spacing="sm">
                    <H4>配置オプション</H4>
                    <Heading level="h3" align="left">左揃え見出し</Heading>
                    <Heading level="h3" align="center">中央揃え見出し</Heading>
                    <Heading level="h3" align="right">右揃え見出し</Heading>
                  </VStack>
                </Card>
                
                <Card variant="outlined" padding="md">
                  <VStack spacing="sm">
                    <H4>ウェイトオプション</H4>
                    <Heading level="h3" weight="normal">Normal Weight</Heading>
                    <Heading level="h3" weight="medium">Medium Weight</Heading>
                    <Heading level="h3" weight="semibold">Semibold Weight</Heading>
                    <Heading level="h3" weight="bold">Bold Weight</Heading>
                  </VStack>
                </Card>
              </Box>
            </VStack>
          </VStack>
        </Section>

        {/* Text Components */}
        <Section spacing="xl" background="lighter" border="both">
          <VStack spacing="lg">
            <H2>Text コンポーネント</H2>
            <Text variant="secondary">
              本文テキストとインラインスタイル
            </Text>
            
            <VStack spacing="lg">
              <Box>
                <Label>サイズ選択</Label>
                <HStack spacing="sm" wrap className="mt-2">
                  {(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'] as const).map((size) => (
                    <Button
                      key={size}
                      variant={textSize === size ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setTextSize(size)}
                    >
                      {size}
                    </Button>
                  ))}
                </HStack>
              </Box>

              <VStack spacing="md">
                <Text size={textSize}>
                  このテキストは選択されたサイズで表示されています。
                  タイポグラフィはUIデザインの重要な要素です。
                </Text>
                
                <Paragraph>
                  <Strong>段落テキスト：</Strong>
                  これは標準的な段落テキストです。
                  <Em>強調されたテキスト</Em>や
                  <Mark>ハイライトされたテキスト</Mark>を含むことができます。
                  <Small>小さなテキスト</Small>も使用可能です。
                </Paragraph>

                <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card variant="filled" padding="md">
                    <VStack spacing="sm">
                      <H4>カラーバリエーション</H4>
                      <Text variant="default">デフォルトテキスト</Text>
                      <Text variant="primary">プライマリテキスト</Text>
                      <Text variant="secondary">セカンダリテキスト</Text>
                      <Text variant="muted">ミュートテキスト</Text>
                      <Text variant="accent">アクセントテキスト</Text>
                      <Text variant="success">成功テキスト</Text>
                      <Text variant="warning">警告テキスト</Text>
                      <Text variant="error">エラーテキスト</Text>
                    </VStack>
                  </Card>

                  <Card variant="filled" padding="md">
                    <VStack spacing="sm">
                      <H4>テキスト装飾</H4>
                      <Text decoration="underline">下線付きテキスト</Text>
                      <Text decoration="line-through">取り消し線テキスト</Text>
                      <Text decoration="overline">上線付きテキスト</Text>
                      <Text transform="uppercase">大文字変換</Text>
                      <Text transform="lowercase">小文字変換</Text>
                      <Text transform="capitalize">頭文字大文字</Text>
                      <Text italic>イタリック体</Text>
                    </VStack>
                  </Card>
                </Box>

                <Card variant="outlined" padding="md">
                  <VStack spacing="sm">
                    <H4>テキストトランケート</H4>
                    <Text truncate className="max-w-md">
                      これは非常に長いテキストで、コンテナの幅を超える場合は省略記号で切り取られます。画面のサイズに応じて適切に表示されます。
                    </Text>
                    <Text clamp={2}>
                      これは複数行のテキストクランプの例です。
                      指定された行数を超えると、テキストは自動的に省略されます。
                      この機能は長い説明文やコンテンツのプレビューに便利です。
                      4行目以降は表示されません。
                    </Text>
                  </VStack>
                </Card>
              </VStack>
            </VStack>
          </VStack>
        </Section>

        {/* Label Components */}
        <Section spacing="xl" background="gradient" border="both">
          <VStack spacing="lg">
            <H2>Label コンポーネント</H2>
            <Text variant="secondary">
              フォームラベルとバッジ表示
            </Text>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <VStack spacing="lg">
                <H4>基本ラベル</H4>
                
                <VStack spacing="md">
                  <Box>
                    <Label htmlFor="username">ユーザー名</Label>
                    <Input id="username" placeholder="ユーザー名を入力" className="mt-1" />
                  </Box>
                  
                  <Box>
                    <Label htmlFor="email" required>
                      メールアドレス
                    </Label>
                    <Input id="email" type="email" placeholder="email@example.com" className="mt-1" />
                    <HelpCaption type="info">
                      必須項目です
                    </HelpCaption>
                  </Box>
                  
                  <Box>
                    <Label htmlFor="disabled" disabled>
                      無効なフィールド
                    </Label>
                    <Input id="disabled" disabled placeholder="無効" className="mt-1" />
                  </Box>
                </VStack>

                <VStack spacing="sm">
                  <H4>アイコン付きラベル</H4>
                  <IconLabel icon={<UserIcon className="h-4 w-4" />}>
                    ユーザー情報
                  </IconLabel>
                  <IconLabel icon={<DocumentTextIcon className="h-4 w-4" />} iconPosition="right">
                    ドキュメント
                  </IconLabel>
                  <IconLabel icon={<StarIcon className="h-4 w-4" />} spacing="xs">
                    お気に入り
                  </IconLabel>
                </VStack>
              </VStack>

              <VStack spacing="lg">
                <H4>バッジラベル</H4>
                
                <VStack spacing="md">
                  <HStack spacing="sm" wrap>
                    <BadgeLabel variant="default">デフォルト</BadgeLabel>
                    <BadgeLabel variant="primary">プライマリ</BadgeLabel>
                    <BadgeLabel variant="secondary">セカンダリ</BadgeLabel>
                    <BadgeLabel variant="success">成功</BadgeLabel>
                    <BadgeLabel variant="warning">警告</BadgeLabel>
                    <BadgeLabel variant="error">エラー</BadgeLabel>
                    <BadgeLabel variant="info">情報</BadgeLabel>
                  </HStack>

                  <HStack spacing="sm" wrap>
                    <BadgeLabel rounded="none">角なし</BadgeLabel>
                    <BadgeLabel rounded="sm">小さい角丸</BadgeLabel>
                    <BadgeLabel rounded="md">中くらい角丸</BadgeLabel>
                    <BadgeLabel rounded="lg">大きい角丸</BadgeLabel>
                    <BadgeLabel rounded="full">完全な丸</BadgeLabel>
                  </HStack>

                  <Card variant="outlined" padding="md">
                    <VStack spacing="sm">
                      <H4>ステータスバッジ</H4>
                      <HStack spacing="sm" wrap>
                        <BadgeLabel variant="success" rounded="full">● オンライン</BadgeLabel>
                        <BadgeLabel variant="warning" rounded="full">● アウェイ</BadgeLabel>
                        <BadgeLabel variant="error" rounded="full">● オフライン</BadgeLabel>
                        <BadgeLabel variant="secondary" rounded="full">● 取り込み中</BadgeLabel>
                      </HStack>
                    </VStack>
                  </Card>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Caption Components */}
        <Section spacing="xl" background="darker" border="both">
          <VStack spacing="lg">
            <H2>Caption コンポーネント</H2>
            <Text variant="secondary">
              画像やテーブルのキャプション表示
            </Text>
            
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <VStack spacing="lg">
                <H4>図表キャプション</H4>
                
                <FigureWithCaption
                  caption="図1: 神託のメソロギアのゲーム画面"
                  captionProps={{ align: 'center' }}
                >
                  <Box className="h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg" />
                </FigureWithCaption>

                <FigureWithCaption
                  caption={
                    <ImageCaption credit="Mythologia Team">
                      カードバトルの様子
                    </ImageCaption>
                  }
                >
                  <Box className="h-32 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg" />
                </FigureWithCaption>
              </VStack>

              <VStack spacing="lg">
                <H4>ヘルプキャプション</H4>
                
                <VStack spacing="md">
                  <Box>
                    <Label>パスワード</Label>
                    <Input type="password" placeholder="パスワード" />
                    <HelpCaption type="info">
                      8文字以上で設定してください
                    </HelpCaption>
                  </Box>

                  <Box>
                    <Label>確認用パスワード</Label>
                    <Input type="password" placeholder="パスワード再入力" />
                    <HelpCaption type="success">
                      パスワードが一致しました
                    </HelpCaption>
                  </Box>

                  <Box>
                    <Label>ユーザー名</Label>
                    <Input placeholder="username" />
                    <HelpCaption type="warning">
                      このユーザー名は既に使用されています
                    </HelpCaption>
                  </Box>

                  <Box>
                    <Label>メールアドレス</Label>
                    <Input type="email" placeholder="email@example.com" />
                    <HelpCaption type="error">
                      有効なメールアドレスを入力してください
                    </HelpCaption>
                  </Box>
                </VStack>
              </VStack>
            </Box>
          </VStack>
        </Section>

        {/* Code Components */}
        <Section spacing="xl" background="lighter" border="both">
          <VStack spacing="lg">
            <H2>Code コンポーネント</H2>
            <Text variant="secondary">
              コード表示とシンタックスハイライト
            </Text>
            
            <VStack spacing="lg">
              <Box>
                <H4>インラインコード</H4>
                <Paragraph>
                  関数 <InlineCode>greet()</InlineCode> は引数として
                  <InlineCode>name: string</InlineCode> を受け取り、
                  挨拶文を返します。変数は <Var>name</Var> として参照されます。
                </Paragraph>
              </Box>

              <Box>
                <H4>コードブロック</H4>
                <CodeBlock
                  language="typescript"
                  title="greeting.ts"
                  showLineNumbers
                  copyable
                >
                  {sampleCode}
                </CodeBlock>
              </Box>

              <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="filled" padding="md">
                  <VStack spacing="sm">
                    <H4>基本コードブロック</H4>
                    <Code variant="block">
                      npm install @mythologia/ui-components
                    </Code>
                  </VStack>
                </Card>

                <Card variant="filled" padding="md">
                  <VStack spacing="sm">
                    <H4>ライトテーマ</H4>
                    <CodeBlock theme="light">
                      yarn add @mythologia/ui-components
                    </CodeBlock>
                  </VStack>
                </Card>
              </Box>

              <Box>
                <H4>キーボードショートカット</H4>
                <VStack spacing="sm">
                  <Text>
                    保存: <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd>
                  </Text>
                  <Text>
                    コピー: <Kbd>Cmd</Kbd> + <Kbd>C</Kbd>
                  </Text>
                  <Text>
                    全選択: <Kbd>Ctrl</Kbd> + <Kbd>A</Kbd>
                  </Text>
                </VStack>
              </Box>
            </VStack>
          </VStack>
        </Section>

        {/* Integration Example */}
        <Section spacing="xl" background="gradient" border="both">
          <VStack spacing="lg">
            <H2 align="center">統合例</H2>
            <Caption align="center" variant="primary">
              複数のタイポグラフィコンポーネントを組み合わせた実用例
            </Caption>
            
            <Card variant="gradient" padding="xl">
              <VStack spacing="lg">
                <H3 variant="gradient">神託のメソロギア - 公式ガイド</H3>
                
                <Paragraph>
                  <Strong>神託のメソロギア</Strong>は、
                  <Em>戦略的思考</Em>と<Em>デッキ構築スキル</Em>が試される
                  カードバトルゲームです。
                </Paragraph>

                <Box>
                  <H4>基本ルール</H4>
                  <VStack spacing="sm">
                    <Text>
                      1. デッキは<InlineCode>40枚</InlineCode>で構成
                    </Text>
                    <Text>
                      2. 同名カードは<InlineCode>3枚</InlineCode>まで
                    </Text>
                    <Text>
                      3. リーダーカードは<InlineCode>1枚</InlineCode>のみ
                    </Text>
                  </VStack>
                </Box>

                <Box>
                  <Label>クイックスタートコマンド</Label>
                  <CodeBlock language="bash" copyable className="mt-2">
                    mythologia start --mode tutorial
                  </CodeBlock>
                  <HelpCaption type="info">
                    初めてプレイする方はチュートリアルモードから始めましょう
                  </HelpCaption>
                </Box>

                <HStack spacing="sm" wrap>
                  <BadgeLabel variant="success">初心者向け</BadgeLabel>
                  <BadgeLabel variant="primary">無料プレイ</BadgeLabel>
                  <BadgeLabel variant="info">日本語対応</BadgeLabel>
                </HStack>
              </VStack>
            </Card>
          </VStack>
        </Section>
      </VStack>
    </Container>
  );
}