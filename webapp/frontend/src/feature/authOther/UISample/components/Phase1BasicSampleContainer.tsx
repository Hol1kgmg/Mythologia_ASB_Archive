'use client';

import { useState } from 'react';
import { Box, Button, Input, Select } from '../../../../components/ui';

export default function Phase1BasicSampleContainer() {
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('');

  const selectOptions = [
    { value: 'dragon', label: 'ドラゴン' },
    { value: 'android', label: 'アンドロイド' },
    { value: 'elemental', label: 'エレメンタル' },
    { value: 'luminus', label: 'ルミナス' },
    { value: 'shade', label: 'シェイド' },
    { value: 'beast', label: 'ビースト' },
    { value: 'human', label: 'ヒューマン' },
    { value: 'undead', label: 'アンデッド' },
    { value: 'oldgod', label: '旧神' },
    { value: 'angel', label: 'アンジェル' },
    { value: 'demon', label: 'デーモン' },
    { value: 'fairy', label: 'フェアリー' },
    { value: 'disabled', label: '選択不可オプション', disabled: true },
  ];

  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-4xl mx-auto my-8 overflow-visible"
    >
      <h2 className="text-2xl font-bold text-gray-300 mb-6">Phase 1: 基本コンポーネント</h2>

      {/* Button Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Buttons</h3>

        <Box className="space-y-4">
          {/* Variants */}
          <Box display="flex" className="flex-wrap gap-2">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </Box>

          {/* Sizes */}
          <Box display="flex" className="flex-wrap items-center gap-2">
            <Button size="xs">XS</Button>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">XL</Button>
          </Box>

          {/* With Icons */}
          <Box display="flex" className="flex-wrap gap-2">
            <Button leftIcon="🔍">検索</Button>
            <Button rightIcon="→">次へ</Button>
            <Button leftIcon="⚙️" rightIcon="▼">
              設定
            </Button>
          </Box>

          {/* States */}
          <Box display="flex" className="flex-wrap gap-2">
            <Button disabled>Disabled</Button>
            <Button fullWidth>Full Width</Button>
          </Box>
        </Box>
      </Box>

      {/* Input Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Input</h3>

        <Box className="space-y-4">
          <Input
            label="通常の入力"
            placeholder="テキストを入力してください"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            helperText="これはヘルパーテキストです"
          />

          <Input
            label="エラー状態"
            placeholder="エラーの例"
            defaultValue=""
            error="入力内容に誤りがあります"
            readOnly
          />

          <Box display="flex" className="gap-2">
            <Input size="sm" placeholder="Small" />
            <Input size="md" placeholder="Medium" />
            <Input size="lg" placeholder="Large" />
          </Box>

          <Input label="無効化された入力" defaultValue="編集できません" disabled readOnly />
        </Box>
      </Box>

      {/* Select Components */}
      <Box
        margin="none"
        padding="md"
        background="default"
        rounded="md"
        className="mb-6 overflow-visible"
      >
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Select</h3>

        <Box className="space-y-4">
          <Select
            label="リーダー選択"
            value={selectValue}
            onChange={setSelectValue}
            options={selectOptions}
            placeholder="リーダーを選択してください"
            helperText="ゲームのリーダーを選択します"
          />

          <Select
            label="エラー状態のセレクト"
            value=""
            onChange={() => {}}
            options={selectOptions}
            error="選択は必須です"
          />

          <Select
            label="無効化されたセレクト"
            value="dragon"
            onChange={() => {}}
            options={selectOptions}
            disabled
          />
        </Box>
      </Box>

      {/* Box Layout Examples */}
      <Box margin="none" padding="md" background="default" rounded="md">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Box Layout</h3>

        <Box className="space-y-4">
          <Box
            padding="md"
            background="gradient"
            border="default"
            rounded="lg"
            shadow="md"
            className="text-gray-300"
          >
            <p>グラデーション背景のBox</p>
          </Box>

          <Box display="flex" padding="sm" background="lighter" rounded="md" className="gap-2">
            <Box padding="sm" background="darker" rounded="sm" className="flex-1">
              Flex Item 1
            </Box>
            <Box padding="sm" background="darker" rounded="sm" className="flex-1">
              Flex Item 2
            </Box>
            <Box padding="sm" background="darker" rounded="sm" className="flex-1">
              Flex Item 3
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
