# easy-zipcode-jp

`easy-zipcode-jp` は、日本の郵便番号を用いた住所検索を簡単に行えるライブラリです。

## 特徴

- TypeScript 対応でシンプルな API のみを提供する軽量ライブラリ
- 住所データを全て含むため外部依存なしにインストールするだけで利用可能
- 郵便番号の前半３桁（郵便局番号）から対応する住所リストが取得可能
- データはエリア単位で動的にインポート、キャッシュされ、必要な部分のみ読み込むことで軽量化

## インストール

```sh
npm install easy-zipcode-jp
```

## 使い方

```typescript
import { search, lookup, resolve } from 'easy-zipcode-jp'

// [
//   { city: '千代田区', pref: '東京都' },
//   { city: '千代田区', pref: '東京都' },
//   { city: '丸の内', pref: '東京都' },
//   ...
// ]
console.log(await search('100-100'))

// {
//   1000000: [{ city: '千代田区', pref: '東京都' }],
//   1000001: [
//     { city: '千代田区', pref: '東京都' },
//     { city: '丸の内', pref: '東京都' },
//   ],
//   1000011: [{ city: '千代田区', pref: '東京都', town: '内幸町' }],
//   ...
// }
console.log(await lookup('100'))

// [
//   { city: '千代田区', pref: '東京都' },
//   { city: '丸の内', pref: '東京都' },
// ]
console.log(await resolve('100-0001'))
```

## API

### `Address` 型

このライブラリで扱う住所データは、都道府県 `pref` 、市区町村 `city` 、町域名 `town` （存在する場合）です。 `Address` 型として参照されます。

```typescript
type Address = {
  pref: string
  city: string
  town?: string
}
```

### `search(zipcode: string): Promise<Address[]>`

`zipcode` として指定した郵便局番号（郵便番号の前半３桁）以上の部分的な郵便番号から該当する全ての住所を配列で返します。
`zipcode` にはハイフンを含めることができます。\
部分的に該当する住所を単純な配列で返すため、ユーザー入力などに対する段階的な検索に適しています。

#### 使用例

```typescript
await search('100')
await search('1001')
await search('100-10')
```

#### 返り値の例

```typescript
[
  { city: '千代田区', pref: '東京都' },
  { city: '千代田区', pref: '東京都' },
  { city: '丸の内', pref: '東京都' },
  // ...
]
```


### `lookup(areacode: string): Promise<Record<string, Address[]> | null>`

`areacode` として指定した郵便局番号（郵便番号の前半３桁）に該当する郵便番号に対する住所の一覧を取得します。 `areacode`に該当するデータがない場合は `null` を返します。 \
郵便番号は対応する住所が複数存在しうるため、返り値は郵便番号をキーとした住所の配列となります。

#### 使用例

```typescript
await lookup('100')
await lookup('101')
```

#### 戻り値の例

```typescript
{
  1000000: [{ city: '千代田区', pref: '東京都' }],
  1000001: [
    { city: '千代田区', pref: '東京都' },
    { city: '丸の内', pref: '東京都' },
  ],
  1000011: [{ city: '千代田区', pref: '東京都', town: '内幸町' }],
  // ...
}
```

### `resolve(zipcode: string): Promise<Address[] | null>`

`zipcode` として指定した郵便番号に該当する住所を取得します。
`zipcode` はハイフンを含んだ `100-0001` と含まない `1000001` がともに使用できます。

#### 使用例

```typescript
await resolve('100-0001')
await resolve('1000002')
```

#### 戻り値の例

```typescript
[
  { "city": "千代田区", "pref": "東京都" },
  { "city": "丸の内", "pref": "東京都" },
]
```

## テスト

本ライブラリは `vitest` を用いてテストされています。

```sh
npm test
```

また検証用に [examples/vite-node/](examples/vite-node/) に簡単なサンプルコードが含まれています。

## ライセンス

MIT
