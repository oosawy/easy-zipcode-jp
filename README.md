# easy-zipcode-jp

`easy-zipcode-jp` は、日本の郵便番号を用いた住所検索を簡単に行えるライブラリです。

## 特徴

- TypeScript 対応でシンプルな API のみを提供する軽量ライブラリ
- 住所データを全て含むため外部依存なしにインストールするだけで利用可能
- 郵便番号の前半 3 桁（エリアコード）から対応する住所リストが取得可能
- データはエリア単位で動的にインポート、キャッシュされ、必要な部分のみ読み込むことで軽量化

## インストール

```sh
npm install easy-zipcode-jp
```

## 使い方

```typescript
import { lookup, resolve } from 'easy-zipcode-jp'

// lookup(areaCode: string): Promise<Address[] | null>
console.log(await lookup('100'))
// [
//   { "zip": "1000000", "prefectures": "東京都", "city": "千代田区", "other": "" },
//   { "zip": "1000011", "prefectures": "東京都", "city": "千代田区", "other": "内幸町" }
// ]

// resolve(zipCode: string): Promise<Address | null>
console.log(await resolve('100-0001'))
// { "zip": "1000001", "prefectures": "東京都", "city": "千代田区", "other": ""  }
```

## API

### `lookup(areaCode: string): Promise<Address[] | null>`

指定したエリアコード（郵便番号の最初の 3 桁）に該当する住所の一覧を取得します。

#### 使用例

```typescript
const result = await lookup('100')
console.log(result)
```

#### 戻り値の例

```json
[
  {
    "zip": "1000000",
    "prefectures": "東京都",
    "city": "千代田区",
    "other": ""
  },
  {
    "zip": "1000011",
    "prefectures": "東京都",
    "city": "千代田区",
    "other": "内幸町"
  },
  {
    ...
  }
]
```

### `resolve(zipCode: string): Promise<Address | null>`

指定した郵便番号に該当する住所を取得します。
`zipCode` としてハイフンを含んだ `100-0001` と含まない `1000001` がともに使用できます。

#### 使用例

```typescript
const result = await resolve('100-0001')
console.log(result)
```

#### 戻り値の例

```json
{
  "zip": "1000001",
  "prefectures": "東京都",
  "city": "千代田区",
  "other": ""
}
```

## 型定義

```typescript
export type Address = {
  zip: string
  prefectures: string
  city: string
  other: string
}
```

## テスト

本ライブラリは `vitest` を用いてテストされています。

```sh
npm test
```

また検証用に [examples/vite-node/](examples/vite-node/) に簡単なサンプルコードが含まれています。

## ライセンス

MIT
