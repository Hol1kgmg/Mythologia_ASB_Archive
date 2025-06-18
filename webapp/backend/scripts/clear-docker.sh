#!/bin/bash

# Docker経由でデータクリアスクリプトを実行するヘルパースクリプト
# 引数をそのままDockerコンテナに渡します

echo "🗑️  Docker経由でデータクリア実行中..."

# 引数を文字列として結合
ARGS="$*"

docker run --rm --network host \
  -v "$(pwd):/app" \
  -w /app \
  -e DATABASE_URL=postgresql://mythologia_user:mythologia_pass@localhost:5432/mythologia_dev \
  node:20-alpine \
  /bin/sh -c "npm install && npm install tsx dotenv-cli -g && npx dotenv -e .env.local -- npx tsx src/db/seeds/clear-data.ts $ARGS"