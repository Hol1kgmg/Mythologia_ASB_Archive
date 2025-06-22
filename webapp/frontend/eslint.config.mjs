import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ESLint設定: Next.js特有のルールに使用
// Biome併用: コードフォーマッティング・基本的なリントはBiomeで実行
// 使い分け:
//   - npm run lint (ESLint): Next.js特有のルール
//   - npm run lint:biome (Biome): 基本的なリント・フォーマット
//   - npm run check:fix (Biome): 自動修正付きの包括的チェック
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
