'use client';

import React, { useState } from 'react';
import { Box, Textarea, Checkbox, Radio } from './ui';

export default function Phase2FormSamplePage() {
  const [textareaValue, setTextareaValue] = useState('');
  const [checkboxStates, setCheckboxStates] = useState({
    basic: false,
    terms: false,
    notifications: false,
    error: false,
  });
  const [radioValue, setRadioValue] = useState('');
  const [radioGroupValue, setRadioGroupValue] = useState('medium');

  const handleCheckboxChange = (key: keyof typeof checkboxStates) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCheckboxStates(prev => ({
      ...prev,
      [key]: e.target.checked,
    }));
  };

  const handleRadioChange = (value: string) => {
    setRadioValue(value);
  };

  const handleRadioGroupChange = (value: string) => {
    setRadioGroupValue(value);
  };

  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-4xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-300 mb-6">Phase 2: フォーム系コンポーネントデモ</h2>
      
      {/* Textarea Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Textarea</h3>
        
        <Box className="space-y-4">
          <Textarea
            label="コメント入力"
            placeholder="ご意見・ご感想をお聞かせください"
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            helperText="最大500文字まで入力できます"
          />
          
          <Textarea
            label="エラー状態のテキストエリア"
            placeholder="エラーの例"
            defaultValue=""
            error="入力内容に誤りがあります"
            readOnly
          />
          
          <Box display="flex" className="gap-4">
            <Box className="flex-1">
              <Textarea size="sm" placeholder="Small (80px)" />
            </Box>
            <Box className="flex-1">
              <Textarea size="md" placeholder="Medium (120px)" />
            </Box>
            <Box className="flex-1">
              <Textarea size="lg" placeholder="Large (160px)" />
            </Box>
          </Box>
          
          <Box display="flex" className="gap-4">
            <Box className="flex-1">
              <Textarea resize="none" placeholder="リサイズ不可" />
            </Box>
            <Box className="flex-1">
              <Textarea resize="vertical" placeholder="垂直リサイズ" />
            </Box>
            <Box className="flex-1">
              <Textarea resize="both" placeholder="自由リサイズ" />
            </Box>
          </Box>
          
          <Textarea
            label="無効化されたテキストエリア"
            defaultValue="編集できません"
            disabled
            readOnly
          />
        </Box>
      </Box>

      {/* Checkbox Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Checkbox</h3>
        
        <Box className="space-y-4">
          <Checkbox
            label="基本的なチェックボックス"
            checked={checkboxStates.basic}
            onChange={handleCheckboxChange('basic')}
          />
          
          <Checkbox
            label="利用規約に同意する"
            description="サービス利用規約およびプライバシーポリシーに同意いただく必要があります"
            checked={checkboxStates.terms}
            onChange={handleCheckboxChange('terms')}
          />
          
          <Checkbox
            variant="primary"
            label="通知を受け取る"
            description="新機能やアップデート情報をメールで受け取ります"
            checked={checkboxStates.notifications}
            onChange={handleCheckboxChange('notifications')}
          />
          
          <Checkbox
            variant="error"
            label="エラー状態のチェックボックス"
            checked={checkboxStates.error}
            onChange={handleCheckboxChange('error')}
            error="このオプションは必須です"
          />
          
          <Box display="flex" className="gap-4 items-center">
            <Checkbox size="sm" label="Small" />
            <Checkbox size="md" label="Medium" />
            <Checkbox size="lg" label="Large" />
          </Box>
          
          <Box display="flex" className="gap-4 items-center">
            <Checkbox variant="default" label="Default" />
            <Checkbox variant="primary" label="Primary" />
            <Checkbox variant="success" label="Success" />
            <Checkbox variant="error" label="Error" />
          </Box>
          
          <Checkbox
            label="無効化されたチェックボックス"
            disabled
            checked
          />
        </Box>
      </Box>

      {/* Radio Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Radio</h3>
        
        <Box className="space-y-6">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">優先度選択</h4>
            <Box className="space-y-2">
              <Radio
                name="priority"
                value="high"
                label="高優先度"
                description="緊急対応が必要な重要度の高い項目"
                checked={radioValue === 'high'}
                onChange={() => handleRadioChange('high')}
              />
              <Radio
                name="priority"
                value="medium"
                label="中優先度"
                description="通常の対応スケジュールで進める項目"
                checked={radioValue === 'medium'}
                onChange={() => handleRadioChange('medium')}
              />
              <Radio
                name="priority"
                value="low"
                label="低優先度"
                description="余裕があるときに対応する項目"
                checked={radioValue === 'low'}
                onChange={() => handleRadioChange('low')}
              />
            </Box>
          </Box>
          
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">サイズバリエーション</h4>
            <Box display="flex" className="gap-6 items-center">
              <Radio
                name="size-demo"
                size="sm"
                label="Small"
                checked={radioGroupValue === 'small'}
                onChange={() => handleRadioGroupChange('small')}
              />
              <Radio
                name="size-demo"
                size="md"
                label="Medium"
                checked={radioGroupValue === 'medium'}
                onChange={() => handleRadioGroupChange('medium')}
              />
              <Radio
                name="size-demo"
                size="lg"
                label="Large"
                checked={radioGroupValue === 'large'}
                onChange={() => handleRadioGroupChange('large')}
              />
            </Box>
          </Box>
          
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">カラーバリエーション</h4>
            <Box display="flex" className="gap-6 items-center">
              <Radio name="color-demo" variant="default" label="Default" />
              <Radio name="color-demo" variant="primary" label="Primary" />
              <Radio name="color-demo" variant="success" label="Success" />
              <Radio name="color-demo" variant="error" label="Error" />
            </Box>
          </Box>
          
          <Radio
            name="disabled-demo"
            label="無効化されたラジオボタン"
            disabled
            checked
          />
          
          <Radio
            variant="error"
            label="エラー状態のラジオボタン"
            error="選択は必須です"
          />
        </Box>
      </Box>
    </Box>
  );
}