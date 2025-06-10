'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  Button, 
  Modal, 
  ConfirmModal,
  Tabs,
  VerticalTabs,
  Popover,
  Tooltip,
  DropdownMenu,
  Accordion,
  AccordionItem,
  HorizontalAccordion,
  VStack,
  HStack
} from './ui';
import { 
  CogIcon, 
  UserIcon, 
  BellIcon, 
  TrashIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

export default function Phase4InteractionSamplePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [glassModalOpen, setGlassModalOpen] = useState(false);

  // Tab data
  const basicTabs = [
    {
      id: 'overview',
      label: '概要',
      icon: <InformationCircleIcon className="h-4 w-4" />,
      content: (
        <VStack spacing="md">
          <p>このタブには概要情報が表示されます。</p>
          <Card variant="outlined" padding="sm">
            <h4 className="font-semibold mb-2">重要な情報</h4>
            <p className="text-sm text-gray-400">ここに重要な詳細情報が記載されています。</p>
          </Card>
        </VStack>
      ),
    },
    {
      id: 'analytics',
      label: '分析',
      icon: <ChartBarIcon className="h-4 w-4" />,
      content: (
        <VStack spacing="md">
          <p>ここには分析データが表示されます。</p>
          <Box className="grid grid-cols-2 gap-4">
            <Card variant="filled" padding="sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1,234</div>
                <div className="text-xs text-gray-400">総ビュー数</div>
              </div>
            </Card>
            <Card variant="filled" padding="sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">567</div>
                <div className="text-xs text-gray-400">アクティブユーザー</div>
              </div>
            </Card>
          </Box>
        </VStack>
      ),
    },
    {
      id: 'settings',
      label: '設定',
      icon: <CogIcon className="h-4 w-4" />,
      content: (
        <VStack spacing="md">
          <p>設定項目がここに表示されます。</p>
          <VStack spacing="sm">
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>通知を有効にする</span>
                <Button variant="success" size="xs" onClick={() => console.log('通知設定を変更')}>
                  有効
                </Button>
              </HStack>
            </Card>
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>自動保存</span>
                <Button variant="primary" size="xs" onClick={() => console.log('自動保存設定を変更')}>
                  オン
                </Button>
              </HStack>
            </Card>
          </VStack>
        </VStack>
      ),
    },
  ];

  const verticalTabs = [
    {
      id: 'profile',
      label: 'プロフィール',
      icon: <UserIcon className="h-5 w-5" />,
      content: (
        <Card variant="default" padding="lg">
          <VStack spacing="lg">
            <h3 className="text-lg font-semibold">プロフィール設定</h3>
            <VStack spacing="md" align="center">
              <Box className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"></Box>
              <VStack spacing="sm" align="center">
                <h4 className="font-semibold">ユーザー名</h4>
                <p className="text-sm text-gray-400">user@example.com</p>
                <Button variant="ghost" size="xs" focusRing={false} onClick={() => console.log('プロフィール編集を開始')}>
                  クリックして編集
                </Button>
              </VStack>
            </VStack>
          </VStack>
        </Card>
      ),
    },
    {
      id: 'notifications',
      label: '通知',
      icon: <BellIcon className="h-5 w-5" />,
      content: (
        <Card variant="default" padding="lg">
          <VStack spacing="lg">
            <h3 className="text-lg font-semibold">通知設定</h3>
            <VStack spacing="sm">
              <Card variant="outlined" padding="sm">
                <HStack justify="between" align="center">
                  <span>メール通知</span>
                  <Button variant="success" size="xs" onClick={() => console.log('メール通知を無効にする')}>
                    有効
                  </Button>
                </HStack>
              </Card>
              <Card variant="outlined" padding="sm">
                <HStack justify="between" align="center">
                  <span>プッシュ通知</span>
                  <Button variant="secondary" size="xs" onClick={() => console.log('プッシュ通知を有効にする')}>
                    無効
                  </Button>
                </HStack>
              </Card>
            </VStack>
          </VStack>
        </Card>
      ),
    },
    {
      id: 'advanced',
      label: '詳細設定',
      icon: <CogIcon className="h-5 w-5" />,
      content: (
        <Card variant="default" padding="lg">
          <VStack spacing="lg">
            <h3 className="text-lg font-semibold">詳細設定</h3>
            <p className="text-sm text-gray-400">高度な設定項目をここで管理できます。</p>
            <VStack spacing="sm">
              <p className="text-sm">• キャッシュクリア: 最後の実行 2時間前</p>
              <p className="text-sm">• ログ出力: ダウンロード可能</p>
              <p className="text-sm text-yellow-400">• データリセット: 注意が必要</p>
            </VStack>
          </VStack>
        </Card>
      ),
    },
  ];

  // Dropdown menu items
  const dropdownItems = [
    {
      id: 'edit',
      label: '編集',
      icon: <DocumentTextIcon className="h-4 w-4" />,
      onClick: () => console.log('編集がクリックされました'),
    },
    {
      id: 'duplicate',
      label: '複製',
      icon: <CubeIcon className="h-4 w-4" />,
      onClick: () => console.log('複製がクリックされました'),
    },
    {
      id: 'separator1',
      label: '',
      separator: true,
      onClick: () => {},
    },
    {
      id: 'delete',
      label: '削除',
      icon: <TrashIcon className="h-4 w-4" />,
      onClick: () => setConfirmModalOpen(true),
    },
  ];

  // Accordion items
  const accordionItems = [
    {
      id: 'getting-started',
      title: 'はじめに',
      icon: <InformationCircleIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="sm">
          <p>このアプリケーションの基本的な使い方を説明します。</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>アカウントを作成する</li>
            <li>プロフィールを設定する</li>
            <li>最初のプロジェクトを作成する</li>
          </ul>
          <p className="text-xs text-blue-400 mt-2">→ ドキュメントで詳細を確認</p>
        </VStack>
      ),
    },
    {
      id: 'features',
      title: '機能紹介',
      icon: <ChartBarIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="sm">
          <p>主要な機能について説明します。</p>
          <Box className="grid grid-cols-2 gap-2">
            <Card variant="outlined" padding="sm">
              <div className="text-center">
                <DocumentTextIcon className="h-6 w-6 mx-auto mb-1 text-blue-400" />
                <div className="text-xs">ドキュメント</div>
              </div>
            </Card>
            <Card variant="outlined" padding="sm">
              <div className="text-center">
                <ChartBarIcon className="h-6 w-6 mx-auto mb-1 text-green-400" />
                <div className="text-xs">分析</div>
              </div>
            </Card>
          </Box>
        </VStack>
      ),
    },
    {
      id: 'advanced',
      title: '高度な使い方',
      icon: <CogIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="sm">
          <p>上級者向けの機能と設定について説明します。</p>
          <Box className="bg-gray-700 rounded p-3 text-xs font-mono">
            <div className="text-green-400"># APIキーの設定例</div>
            <div className="text-gray-300">export API_KEY=&quot;your-api-key&quot;</div>
          </Box>
        </VStack>
      ),
    },
    {
      id: 'troubleshooting',
      title: 'トラブルシューティング',
      disabled: true,
      content: <p>現在準備中です。</p>,
    },
  ];

  // Horizontal Accordion items
  const horizontalAccordionItems = [
    {
      id: 'dashboard',
      title: 'ダッシュボード',
      icon: <ChartBarIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="md">
          <h4 className="text-lg font-semibold">ダッシュボード</h4>
          <Box className="grid grid-cols-2 gap-4">
            <Card variant="filled" padding="sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">256</div>
                <div className="text-xs text-gray-400">アクティブユーザー</div>
              </div>
            </Card>
            <Card variant="filled" padding="sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">1,024</div>
                <div className="text-xs text-gray-400">総セッション</div>
              </div>
            </Card>
          </Box>
          <p className="text-sm text-gray-400">リアルタイムの統計情報を表示しています。</p>
        </VStack>
      ),
    },
    {
      id: 'documents',
      title: 'ドキュメント',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="md">
          <h4 className="text-lg font-semibold">ドキュメント管理</h4>
          <VStack spacing="sm">
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>API仕様書.pdf</span>
                <Button variant="primary" size="xs">開く</Button>
              </HStack>
            </Card>
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>ユーザーガイド.md</span>
                <Button variant="secondary" size="xs">編集</Button>
              </HStack>
            </Card>
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>設計書.docx</span>
                <Button variant="ghost" size="xs">表示</Button>
              </HStack>
            </Card>
          </VStack>
        </VStack>
      ),
    },
    {
      id: 'settings',
      title: '設定',
      icon: <CogIcon className="h-5 w-5" />,
      defaultOpen: true,
      content: (
        <VStack spacing="md">
          <h4 className="text-lg font-semibold">アプリケーション設定</h4>
          <VStack spacing="sm">
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>テーマ</span>
                <Button variant="secondary" size="xs">ダークモード</Button>
              </HStack>
            </Card>
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>言語</span>
                <Button variant="secondary" size="xs">日本語</Button>
              </HStack>
            </Card>
            <Card variant="outlined" padding="sm">
              <HStack justify="between" align="center">
                <span>通知</span>
                <Button variant="success" size="xs">有効</Button>
              </HStack>
            </Card>
          </VStack>
        </VStack>
      ),
    },
    {
      id: 'help',
      title: 'ヘルプ',
      icon: <InformationCircleIcon className="h-5 w-5" />,
      content: (
        <VStack spacing="md">
          <h4 className="text-lg font-semibold">ヘルプ & サポート</h4>
          <VStack spacing="sm">
            <p className="text-sm text-gray-400">よくある質問やサポート情報をここで確認できます。</p>
            <VStack spacing="xs">
              <Button variant="primary" size="sm" fullWidth>FAQ を見る</Button>
              <Button variant="secondary" size="sm" fullWidth>サポートに連絡</Button>
              <Button variant="ghost" size="sm" fullWidth>チュートリアル</Button>
            </VStack>
          </VStack>
        </VStack>
      ),
    },
  ];

  return (
    <Box
      background="darker"
      padding="lg"
      rounded="lg"
      border="default"
      className="w-full max-w-6xl mx-auto my-8"
    >
      <h2 className="text-2xl font-bold text-gray-300 mb-6">Phase 4: インタラクション系コンポーネントデモ</h2>
      
      {/* Modal Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Modal</h3>
        
        <HStack spacing="md" wrap>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            基本モーダル
          </Button>
          <Button variant="secondary" onClick={() => setGlassModalOpen(true)}>
            ガラスエフェクト
          </Button>
          <Button variant="danger" onClick={() => setConfirmModalOpen(true)}>
            確認ダイアログ
          </Button>
        </HStack>
      </Box>

      {/* Tabs Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Tabs</h3>
        
        <VStack spacing="lg">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">基本的なタブ</h4>
            <Tabs tabs={basicTabs} variant="default" />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">アンダーラインスタイル</h4>
            <Tabs tabs={basicTabs} variant="underline" />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">縦型タブ</h4>
            <VerticalTabs tabs={verticalTabs} />
          </Box>
        </VStack>
      </Box>

      {/* Popover Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Popover</h3>
        
        <VStack spacing="lg">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">基本的なポップオーバー（サイズ指定可能）</h4>
            <HStack spacing="md" wrap>
              <Popover
                trigger={
                  <span className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                    情報を表示
                  </span>
                }
                placement="bottom-start"
                size="lg"
              >
                <VStack spacing="sm">
                  <h4 className="font-semibold">詳細情報</h4>
                  <p className="text-sm">ここに詳細な説明が表示されます。ポップオーバーは軽量な情報表示に適しています。</p>
                  <p className="text-xs text-blue-400 mt-2">→ 詳細ページへ移動</p>
                </VStack>
              </Popover>

              <Popover
                trigger={
                  <span className="inline-block px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                    設定
                  </span>
                }
                placement="bottom-center"
                variant="glass"
                size="sm"
              >
                <VStack spacing="sm">
                  <h4 className="font-semibold">クイック設定</h4>
                  <VStack spacing="xs">
                    <div className="w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-sm transition-colors duration-200 text-left cursor-pointer">
                      オプション 1
                    </div>
                    <div className="w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-sm transition-colors duration-200 text-left cursor-pointer">
                      オプション 2
                    </div>
                    <div className="w-full px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded text-sm transition-colors duration-200 text-left cursor-pointer">
                      オプション 3
                    </div>
                  </VStack>
                </VStack>
              </Popover>

              <DropdownMenu
                trigger={
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                    アクション
                    <EllipsisVerticalIcon className="h-4 w-4" />
                  </span>
                }
                items={dropdownItems}
              />
            </HStack>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">ツールチップ</h4>
            <HStack spacing="md" wrap>
              <Tooltip content="これは基本的なツールチップです">
                <span className="inline-block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                  ホバーしてください
                </span>
              </Tooltip>
              
              <Tooltip content="削除すると元に戻せません" placement="top-center">
                <span className="inline-block px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                  <TrashIcon className="h-4 w-4" />
                </span>
              </Tooltip>

              <Tooltip content="新しいアイテムを追加します" placement="right-center">
                <span className="inline-block px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors duration-200 cursor-pointer">
                  <PlusIcon className="h-4 w-4" />
                </span>
              </Tooltip>
            </HStack>
          </Box>
        </VStack>
      </Box>

      {/* Accordion Components */}
      <Box margin="none" padding="md" background="default" rounded="md" className="mb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Accordion</h3>
        
        <VStack spacing="lg">
          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">基本的なアコーディオン</h4>
            <Accordion items={accordionItems} variant="default" />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">ボーダー付きアコーディオン</h4>
            <Accordion items={accordionItems.slice(0, 2)} variant="bordered" allowMultiple />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">ボーダーなしアコーディオン</h4>
            <Accordion items={accordionItems.slice(0, 3)} variant="default" showBorder={false} />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">個別アコーディオンアイテム</h4>
            <VStack spacing="sm">
              <AccordionItem
                title="カスタムアイテム 1"
                icon={<DocumentTextIcon className="h-5 w-5" />}
                variant="bordered"
                defaultOpen
              >
                <p>これは個別に管理されるアコーディオンアイテムです。</p>
                <p className="text-xs text-blue-400 mt-2">→ アクションは右クリックメニューから実行</p>
              </AccordionItem>
              
              <AccordionItem
                title="カスタムアイテム 2"
                icon={<CogIcon className="h-5 w-5" />}
                variant="bordered"
              >
                <VStack spacing="sm">
                  <p>複雑な内容も含めることができます。</p>
                  <Card variant="filled" padding="sm">
                    <HStack justify="between" align="center">
                      <span>設定項目</span>
                      <Button variant="primary" size="xs" onClick={() => console.log('設定を変更')}>
                        設定済み
                      </Button>
                    </HStack>
                  </Card>
                </VStack>
              </AccordionItem>
            </VStack>
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">横向きアコーディオン（右向き）</h4>
            <HorizontalAccordion 
              items={horizontalAccordionItems} 
              direction="right"
              buttonWidth="w-16"
              contentWidth="w-96"
            />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">横向きアコーディオン（左向き）</h4>
            <HorizontalAccordion 
              items={horizontalAccordionItems.slice(0, 3)} 
              direction="left"
              buttonWidth="w-16"
              contentWidth="w-80"
            />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">横向きアコーディオン（複数選択可能・右向き）</h4>
            <HorizontalAccordion 
              items={horizontalAccordionItems.slice(0, 3)} 
              direction="right"
              allowMultiple
              buttonWidth="w-16"
              contentWidth="w-80"
            />
          </Box>

          <Box>
            <h4 className="text-md font-medium text-gray-300 mb-3">横向きアコーディオン（ボーダーなし・左向き）</h4>
            <HorizontalAccordion 
              items={horizontalAccordionItems.slice(0, 3)} 
              direction="left"
              showBorder={false}
              buttonWidth="w-16"
              contentWidth="w-80"
            />
          </Box>
        </VStack>
      </Box>

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="基本モーダル"
        description="これは基本的なモーダルダイアログです。"
        size="lg"
        footer={
          <HStack justify="end" spacing="sm">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              キャンセル
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              確認
            </Button>
          </HStack>
        }
      >
        <VStack spacing="md">
          <p>モーダルの内容がここに表示されます。</p>
          <Card variant="outlined" padding="sm">
            <h4 className="font-semibold mb-2">重要な情報</h4>
            <p className="text-sm text-gray-400">
              このモーダルには重要な情報や操作が含まれています。
              ユーザーの注意を引く必要がある場合に使用します。
            </p>
          </Card>
          <p className="text-sm text-gray-400">
            モーダルの外側をクリックするか、Escキーで閉じることができます。
          </p>
        </VStack>
      </Modal>

      <Modal
        isOpen={glassModalOpen}
        onClose={() => setGlassModalOpen(false)}
        title="ガラスエフェクトモーダル"
        size="md"
        variant="glass"
      >
        <VStack spacing="md">
          <p>このモーダルはガラスエフェクトを使用しています。</p>
          <p className="text-sm text-gray-400">
            背景がぼかされ、半透明の効果で現代的な見た目になります。
          </p>
        </VStack>
      </Modal>

      <ConfirmModal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => console.log('削除が確認されました')}
        title="削除の確認"
        message="この操作は元に戻すことができません。本当に削除しますか？"
        confirmText="削除する"
        cancelText="キャンセル"
        variant="danger"
      />
    </Box>
  );
}