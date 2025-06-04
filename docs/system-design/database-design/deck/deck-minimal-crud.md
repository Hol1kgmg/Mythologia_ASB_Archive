# デッキ最小CRUD設計

## 概要

デッキコードを最大限活用し、データ転送量を最小化したCRUD操作の設計です。
`deck_code` にすべてのカード情報を格納し、API で扱うデータを必要最小限に絞ります。

## 設計方針

### データ最小化原則（既存テーブル活用）
- **既存テーブル構造**: 変更せずそのまま活用
- **API最小化**: レスポンスで必要最小限のデータのみ送信
- **deck_code活用**: カード構成情報の主要ソース
- **フロントエンド展開**: クライアント側でdeck_codeを解析

### 既存テーブルとの対応
```typescript
// 既存のdecksテーブル（変更なし）
interface DeckEntity {
  id: string;
  userId: string;
  leaderId: number;          // DBに保存（冗長だがパフォーマンス重視）
  name: string;              // DBに保存
  description?: string;      // DBに保存
  deckCode: string;          // カード構成のメインソース
  cardCount: number;         // DBに保存
  isPublic: boolean;
  tags: string[];
  likes: number;
  views: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## API最小化戦略

### レスポンス最小化

既存のテーブルから必要最小限のデータのみを選択してレスポンス

```sql
-- 最小レスポンス用クエリ例
SELECT 
  id,
  user_id,
  deck_code,     -- フロントエンドで展開される
  is_public,
  likes,
  views,
  created_at,
  updated_at
FROM decks 
WHERE id = ? AND is_deleted = false;
```

### TypeScript型定義

```typescript
// 最小リクエスト型
interface CreateDeckRequest {
  deckCode: string;              // 拡張フォーマット（全情報含む）
}

interface UpdateDeckRequest {
  deckCode?: string;             // 拡張フォーマット
  isPublic?: boolean;            // 公開設定のみ変更可能
}

// 最小レスポンス型
interface DeckResponse {
  id: string;
  userId: string;
  deckCode: string;              // フロントエンドで展開
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// フロントエンド用展開型（API経由では送らない）
interface DeckExpanded {
  id: string;
  userId: string;
  leaderId: number;              // deck_codeから展開
  name: string;                  // deck_codeから展開
  description?: string;          // deck_codeから展開
  tags: string[];               // deck_codeから展開
  cards: DeckCard[];            // deck_codeから展開
  cardCount: number;            // 計算値
  isPublic: boolean;
  likes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}
```

## 拡張デッキコード仕様

### フォーマット定義
```
構造: leaderId|name|description|tags|cardData
区切り文字:
  - | (パイプ): メインセクション区切り
  - , (カンマ): 配列要素区切り
  - : (コロン): キー値区切り

例: "1|ドラゴンラッシュ|速攻型デッキ|速攻,ドラゴン|10015:2,10028:3,10025:3"
```

### エンコード・デコード実装

```typescript
export class ExtendedDeckCodec {
  private static readonly DELIMITER = '|';
  private static readonly ARRAY_DELIMITER = ',';
  private static readonly KV_DELIMITER = ':';
  
  static encode(data: DeckCodeParts): string {
    const parts = [
      data.leaderId.toString(),
      this.escapeString(data.name),
      this.escapeString(data.description || ''),
      data.tags.map(tag => this.escapeString(tag)).join(this.ARRAY_DELIMITER),
      data.cards.map(card => `${card.cardId}${this.KV_DELIMITER}${card.quantity}`).join(this.ARRAY_DELIMITER)
    ];
    
    return parts.join(this.DELIMITER);
  }
  
  static decode(deckCode: string): DeckCodeParts {
    const parts = deckCode.split(this.DELIMITER);
    
    if (parts.length !== 5) {
      throw new Error('無効なデッキコード形式');
    }
    
    const [leaderIdStr, nameStr, descStr, tagsStr, cardsStr] = parts;
    
    return {
      leaderId: parseInt(leaderIdStr, 10),
      name: this.unescapeString(nameStr),
      description: descStr ? this.unescapeString(descStr) : undefined,
      tags: tagsStr ? tagsStr.split(this.ARRAY_DELIMITER).map(tag => this.unescapeString(tag)) : [],
      cards: cardsStr.split(this.ARRAY_DELIMITER).map(cardStr => {
        const [cardId, quantityStr] = cardStr.split(this.KV_DELIMITER);
        return {
          cardId,
          quantity: parseInt(quantityStr, 10)
        };
      })
    };
  }
  
  private static escapeString(str: string): string {
    return str
      .replace(/\|/g, '%7C')
      .replace(/,/g, '%2C')
      .replace(/:/g, '%3A');
  }
  
  private static unescapeString(str: string): string {
    return str
      .replace(/%7C/g, '|')
      .replace(/%2C/g, ',')
      .replace(/%3A/g, ':');
  }
  
  // バリデーション
  static validate(deckCode: string): ValidationResult {
    const errors: string[] = [];
    
    try {
      const decoded = this.decode(deckCode);
      
      // リーダーID検証
      if (decoded.leaderId < 1 || decoded.leaderId > 5) {
        errors.push('無効なリーダーID');
      }
      
      // デッキ名検証
      if (!decoded.name || decoded.name.length > 100) {
        errors.push('デッキ名が無効');
      }
      
      // カード枚数検証
      const totalCards = decoded.cards.reduce((sum, card) => sum + card.quantity, 0);
      if (totalCards < 30 || totalCards > 40) {
        errors.push(`カード枚数が無効: ${totalCards}枚`);
      }
      
      // カード重複検証
      const cardIds = decoded.cards.map(card => card.cardId);
      if (new Set(cardIds).size !== cardIds.length) {
        errors.push('重複したカードID');
      }
      
    } catch (error) {
      errors.push('デッキコード解析エラー');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
```

## API設計

### エンドポイント定義

```typescript
// デッキ作成
POST /api/decks
Request: {
  deckCode: string  // 拡張フォーマット（全情報含む）
}
Response: DeckResponse

// デッキ取得
GET /api/decks/:id
Response: DeckResponse

// デッキ更新
PUT /api/decks/:id
Request: {
  deckCode?: string,    // 新しいデッキコード
  isPublic?: boolean    // 公開設定のみ
}
Response: DeckResponse

// デッキ削除
DELETE /api/decks/:id
Response: 204 No Content

// デッキ一覧
GET /api/decks
Query: ?user_id=xxx&is_public=true&sort=likes&limit=20
Response: { decks: DeckResponse[], pagination: PaginationInfo }
```

### サービス実装

```typescript
export class MinimalDeckService {
  constructor(private db: DatabaseAdapter) {}
  
  async createDeck(userId: string, request: CreateDeckRequest): Promise<DeckResponse> {
    // デッキコード検証
    const validation = ExtendedDeckCodec.validate(request.deckCode);
    if (!validation.isValid) {
      throw new ValidationError('無効なデッキコード', validation.errors);
    }
    
    // デッキコードから必要情報を展開（DBに保存するため）
    const decoded = ExtendedDeckCodec.decode(request.deckCode);
    
    // データベースに全情報を保存（既存テーブル構造に従う）
    const deck = await this.db.createDeck({
      id: generateUUID(),
      userId,
      leaderId: decoded.leaderId,
      name: decoded.name,
      description: decoded.description,
      deckCode: request.deckCode,
      cardCount: decoded.cards.reduce((sum, card) => sum + card.quantity, 0),
      isPublic: false,  // デフォルト非公開
      tags: decoded.tags,
      likes: 0,
      views: 0,
      isDeleted: false,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return this.toResponse(deck);
  }
  
  async getDeck(deckId: string, viewerId?: string): Promise<DeckResponse | null> {
    const deck = await this.db.findDeckById(deckId);
    
    if (!deck || deck.isDeleted) {
      return null;
    }
    
    // 公開チェック
    if (!deck.isPublic && deck.userId !== viewerId) {
      return null;
    }
    
    // 閲覧数更新（所有者以外）
    if (viewerId && deck.userId !== viewerId) {
      await this.db.incrementViews(deckId);
      deck.views += 1;
    }
    
    return this.toResponse(deck);
  }
  
  async updateDeck(
    deckId: string, 
    userId: string, 
    request: UpdateDeckRequest
  ): Promise<DeckResponse> {
    const deck = await this.db.findDeckById(deckId);
    
    if (!deck || deck.isDeleted || deck.userId !== userId) {
      throw new NotFoundError('デッキが見つかりません');
    }
    
    const updates: Partial<DeckEntity> = {
      updatedAt: new Date()
    };
    
    // デッキコード更新
    if (request.deckCode) {
      const validation = ExtendedDeckCodec.validate(request.deckCode);
      if (!validation.isValid) {
        throw new ValidationError('無効なデッキコード', validation.errors);
      }
      updates.deckCode = request.deckCode;
    }
    
    // 公開設定更新
    if (request.isPublic !== undefined) {
      updates.isPublic = request.isPublic;
    }
    
    const updatedDeck = await this.db.updateDeck(deckId, updates);
    return this.toResponse(updatedDeck);
  }
  
  async listDecks(filters: DeckListFilters): Promise<DeckListResponse> {
    const decks = await this.db.findDecks({
      userId: filters.userId,
      isPublic: filters.isPublic,
      isDeleted: false,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
      sortBy: filters.sort || 'createdAt',
      sortOrder: filters.order || 'desc'
    });
    
    const total = await this.db.countDecks(filters);
    
    return {
      decks: decks.map(deck => this.toResponse(deck)),
      pagination: {
        total,
        limit: filters.limit || 20,
        offset: filters.offset || 0
      }
    };
  }
  
  private toResponse(deck: DeckEntity): DeckResponse {
    // 最小限のデータのみレスポンスに含める
    return {
      id: deck.id,
      userId: deck.userId,
      deckCode: deck.deckCode,  // フロントエンドで展開される
      isPublic: deck.isPublic,
      likes: deck.likes,
      views: deck.views,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString()
    };
    // 以下のデータはレスポンスに含めない（データベースには保存済み）:
    // - leaderId, name, description, tags (deck_codeに含まれる)
    // - cardCount (計算可能)
  }
}
```

## フロントエンド実装

### デッキコード展開フック

```typescript
// フロントエンドでデッキコードを展開
export function useDeckExpansion(deckResponse: DeckResponse): DeckExpanded {
  return useMemo(() => {
    const decoded = ExtendedDeckCodec.decode(deckResponse.deckCode);
    
    return {
      ...deckResponse,
      leaderId: decoded.leaderId,
      name: decoded.name,
      description: decoded.description,
      tags: decoded.tags,
      cards: decoded.cards,
      cardCount: decoded.cards.reduce((sum, card) => sum + card.quantity, 0)
    };
  }, [deckResponse.deckCode]);
}

// 使用例
function DeckDetailPage({ deckId }: { deckId: string }) {
  const { data: deckResponse } = useQuery(['deck', deckId], () => 
    api.getDeck(deckId)
  );
  
  const deck = useDeckExpansion(deckResponse);
  
  return (
    <div>
      <h1>{deck.name}</h1>
      <p>リーダー: {deck.leaderId}</p>
      <p>カード数: {deck.cardCount}</p>
      <p>いいね: {deck.likes}</p>
      {/* カードリスト表示 */}
      <CardList cards={deck.cards} />
    </div>
  );
}
```

### デッキ作成フォーム

```typescript
function DeckCreateForm() {
  const [deckData, setDeckData] = useState<DeckCodeParts>({
    leaderId: 1,
    name: '',
    description: '',
    tags: [],
    cards: []
  });
  
  const createDeckMutation = useMutation(api.createDeck);
  
  const handleSubmit = async () => {
    // フロントエンドでデッキコード生成
    const deckCode = ExtendedDeckCodec.encode(deckData);
    
    // 最小データのみAPI送信
    await createDeckMutation.mutateAsync({
      deckCode
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* デッキ構築UI */}
    </form>
  );
}
```

## メリット・トレードオフ

### メリット

#### 1. データ転送量削減
- APIレスポンスサイズ最小化（約60%削減）
- ネットワーク帯域の節約
- モバイル環境での高速化

#### 2. 既存システムとの互換性
- データベーステーブル構造は変更なし
- 既存のクエリ・インデックスをそのまま活用
- 段階的な移行が可能

#### 3. キャッシュ効率
- 少ないデータでキャッシュヒット率向上
- CDNでの配信最適化

#### 4. 拡張性
- デッキコード形式の柔軟な拡張
- API変更なしでの機能追加

### トレードオフ

#### 1. フロントエンド処理負荷
- deck_code解析処理がクライアント側で発生
- ただし、軽量な文字列操作のため影響は最小限

#### 2. データ冗長性
- デッキコードとDBの両方に同じ情報を保存
- ストレージ使用量の軽微な増加（約10-15%）

#### 3. 実装複雑性
- デッキコード生成・解析ロジックの管理
- ただし、共通ライブラリで対応可能

## 実装効果予測

```typescript
// レスポンスサイズ比較例
interface FullDeckResponse {  // 従来（約800バイト）
  id: string; userId: string; leaderId: number; name: string;
  description: string; cards: DeckCard[]; cardCount: number;
  isPublic: boolean; tags: string[]; likes: number; views: number;
  createdAt: string; updatedAt: string;
}

interface MinimalDeckResponse {  // 最小化（約300バイト）
  id: string; userId: string; deckCode: string;
  isPublic: boolean; likes: number; views: number;
  createdAt: string; updatedAt: string;
}
```

この設計により、既存システムの安定性を保ちながら、必要最小限のデータ転送でデッキシステムを効率的に運用できます。

## 将来実装予定機能

### デッキ複製（Fork）カウント機能

他プレイヤーのデッキをベースに新しいデッキを作成する際の複製数を追跡する機能です。GitHubのfork機能にインスパイアされた、デッキの人気度と影響力を測る指標として実装予定です。

#### 概要
```typescript
interface DeckEntity {
  // 既存フィールド...
  forkCount: number;        // このデッキが複製された回数
  originalDeckId?: string;  // 元となったデッキのID（複製の場合）
  forkDate?: Date;         // 複製された日時
}
```

#### 実装アイデア

##### 1. フォーク関係の追跡
```sql
-- 将来のテーブル拡張案
ALTER TABLE decks ADD COLUMN fork_count INTEGER DEFAULT 0;
ALTER TABLE decks ADD COLUMN original_deck_id VARCHAR(36) NULL;
ALTER TABLE decks ADD COLUMN fork_date TIMESTAMP NULL;

-- フォーク履歴テーブル（詳細な追跡用）
CREATE TABLE deck_forks (
  id VARCHAR(36) PRIMARY KEY,
  original_deck_id VARCHAR(36) NOT NULL,
  forked_deck_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  FOREIGN KEY (original_deck_id) REFERENCES decks(id),
  FOREIGN KEY (forked_deck_id) REFERENCES decks(id)
);
```

##### 2. API設計案
```typescript
// デッキフォーク作成
POST /api/decks/:id/fork
Request: {
  name?: string,           // 新しいデッキ名（省略時は「[元の名前] - コピー」）
  modifications?: {        // フォーク時の変更点
    cards?: DeckCard[],    // カード構成の変更
    description?: string   // 説明の追加
  }
}

// フォーク履歴取得
GET /api/decks/:id/forks
Response: {
  forks: Array<{
    id: string,
    name: string,
    userId: string,
    userName: string,
    createdAt: string,
    modifications: string[]  // 変更点の要約
  }>,
  totalCount: number
}
```

##### 3. ユースケース
- **人気デッキの発見**: フォーク数でデッキの実用性を判断
- **メタゲーム分析**: どのデッキが改良のベースになっているか
- **コミュニティ貢献**: 良いデッキレシピを作った作者への評価
- **デッキ系譜**: 戦略の進化過程を追跡

##### 4. UI/UX案
```typescript
// デッキ詳細画面での表示
function DeckDetailPage({ deck }) {
  return (
    <div>
      {/* 既存の表示 */}
      <div className="deck-stats">
        <StatItem label="いいね" value={deck.likes} />
        <StatItem label="閲覧数" value={deck.views} />
        <StatItem label="フォーク数" value={deck.forkCount} />
      </div>
      
      {/* フォークボタン */}
      <Button onClick={handleFork}>
        このデッキをベースに作成
      </Button>
      
      {/* フォーク元の表示 */}
      {deck.originalDeckId && (
        <div className="fork-info">
          <Link to={`/decks/${deck.originalDeckId}`}>
            元のデッキを見る
          </Link>
        </div>
      )}
    </div>
  );
}
```

##### 5. 実装段階
1. **Phase 1**: 基本的なフォーク機能（fork_countの追加）
2. **Phase 2**: フォーク履歴の詳細追跡
3. **Phase 3**: フォーク時の差分表示・変更点可視化
4. **Phase 4**: デッキ系譜ツリーの可視化

この機能により、デッキコミュニティの活性化と、戦略の進化過程の可視化が期待されます。