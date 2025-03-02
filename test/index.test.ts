import { describe, test, expect, vi } from 'vitest'

vi.mock('../assets', () => {
  const fakeAreaMap = {
    '1000000': [{ city: '千代田区', pref: '東京都' }],
    '1000001': [
      { city: '千代田区', pref: '東京都' },
      { city: '丸の内', pref: '東京都' },
    ],

    '1000011': [{ pref: '東京都', city: '千代田区', town: '内幸町' }],
    '1000012': [{ pref: '東京都', city: '千代田区', town: '日比谷公園' }],
    '1000013': [
      { pref: '東京都', city: '千代田区', town: '霞が関（次のビルを除く）' },
    ],
    '1000014': [
      { pref: '東京都', city: '千代田区', town: '永田町（次のビルを除く）' },
    ],

    '1001100': [{ pref: '東京都', city: '三宅島三宅村' }],
    '1001101': [{ pref: '東京都', city: '三宅島三宅村', town: '神着' }],
  }
  return {
    default: {
      '1': () =>
        Promise.resolve({
          default: {
            '100': () =>
              Promise.resolve({
                default: fakeAreaMap,
              }),
          },
        }),
    },
  }
})

import { getAreaMap, search, lookup, resolve, parseCode } from '../src/internal'

//
// getAreaMap のテスト
//
describe('getAreaMap', () => {
  test('有効なエリアコードの場合、正しい AreaMap を返す', async () => {
    const areaMap = await getAreaMap('100')
    expect(areaMap).toBeDefined()
    expect(Object.keys(areaMap ?? {}).length).toBe(8)
    expect(areaMap).toHaveProperty('1000000')
    expect(areaMap).toHaveProperty('1000001')
    expect(areaMap).toMatchInlineSnapshot(`
      {
        "1000000": [
          {
            "city": "千代田区",
            "pref": "東京都",
          },
        ],
        "1000001": [
          {
            "city": "千代田区",
            "pref": "東京都",
          },
          {
            "city": "丸の内",
            "pref": "東京都",
          },
        ],
        "1000011": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "内幸町",
          },
        ],
        "1000012": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "日比谷公園",
          },
        ],
        "1000013": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "霞が関（次のビルを除く）",
          },
        ],
        "1000014": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "永田町（次のビルを除く）",
          },
        ],
        "1001100": [
          {
            "city": "三宅島三宅村",
            "pref": "東京都",
          },
        ],
        "1001101": [
          {
            "city": "三宅島三宅村",
            "pref": "東京都",
            "town": "神着",
          },
        ],
      }
    `)
  })

  test('存在しないエリアコードの場合、null を返す', async () => {
    const areaMap = await getAreaMap('008')
    expect(areaMap).toBeNull()
  })
})

//
// lookup のテスト
//
describe('lookup', () => {
  test('有効なエリアコードの場合、lookup は正しいマッピングを返す', async () => {
    const result = await lookup('100')
    expect(result).toBeDefined()
    expect(result?.['1000000']).toEqual([{ city: '千代田区', pref: '東京都' }])
    expect(result).toMatchInlineSnapshot(`
      {
        "1000000": [
          {
            "city": "千代田区",
            "pref": "東京都",
          },
        ],
        "1000001": [
          {
            "city": "千代田区",
            "pref": "東京都",
          },
          {
            "city": "丸の内",
            "pref": "東京都",
          },
        ],
        "1000011": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "内幸町",
          },
        ],
        "1000012": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "日比谷公園",
          },
        ],
        "1000013": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "霞が関（次のビルを除く）",
          },
        ],
        "1000014": [
          {
            "city": "千代田区",
            "pref": "東京都",
            "town": "永田町（次のビルを除く）",
          },
        ],
        "1001100": [
          {
            "city": "三宅島三宅村",
            "pref": "東京都",
          },
        ],
        "1001101": [
          {
            "city": "三宅島三宅村",
            "pref": "東京都",
            "town": "神着",
          },
        ],
      }
    `)
  })

  test('不正なエリアコード (文字列) の場合、エラーを投げる', async () => {
    await expect(lookup('xyz')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
  })

  test('存在しないエリアコードの場合、null を返す', async () => {
    const result = await lookup('008')
    expect(result).toBeNull()
  })
})

//
// resolve のテスト
//
describe('resolve', () => {
  test('有効な郵便番号の場合、正しい住所リストを返す', async () => {
    const result = await resolve('100-0001')
    expect(result).toMatchInlineSnapshot(`
      [
        {
          "city": "千代田区",
          "pref": "東京都",
        },
        {
          "city": "丸の内",
          "pref": "東京都",
        },
      ]
    `)
  })

  test('存在しない郵便番号の場合、null を返す', async () => {
    const result = await resolve('100-9999')
    expect(result).toBeNull()
  })

  test('不正な郵便番号フォーマットの場合、エラーを投げる', async () => {
    await expect(
      resolve('abcd1234')
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
  })

  test('不完全な郵便番号の場合、エラーを投げる', async () => {
    await expect(resolve('123')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: resolve 関数は、100-0001 または 1000001 のような完全な郵便番号が必要です。]`
    )
    await expect(resolve('1234')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: resolve 関数は、100-0001 または 1000001 のような完全な郵便番号が必要です。]`
    )
    await expect(resolve('123-4')).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: resolve 関数は、100-0001 または 1000001 のような完全な郵便番号が必要です。]`
    )
  })
})

//
// parseCode のテスト
//
describe('parseCode', () => {
  test('ハイフンありの完全な郵便番号をパースできる', () => {
    expect(parseCode('100-0001')).toStrictEqual({
      area: '100',
      local: '0001',
      zip: '1000001',
      complete: true,
    })
  })

  test('ハイフンなしの完全な郵便番号をパースできる', () => {
    expect(parseCode('1000001')).toStrictEqual({
      area: '100',
      local: '0001',
      zip: '1000001',
      complete: true,
    })
  })

  test('エリア部分のみの場合、部分的な結果を返す', () => {
    expect(parseCode('100')).toStrictEqual({
      area: '100',
      local: '',
      zip: undefined,
      complete: false,
    })
  })

  test('部分的なローカル部分の場合、部分的な結果を返す', () => {
    expect(parseCode('100-0')).toStrictEqual({
      area: '100',
      local: '0',
      zip: undefined,
      complete: false,
    })
    expect(parseCode('100-01')).toStrictEqual({
      area: '100',
      local: '01',
      zip: undefined,
      complete: false,
    })
    expect(parseCode('100-012')).toStrictEqual({
      area: '100',
      local: '012',
      zip: undefined,
      complete: false,
    })
  })

  test('不正な郵便番号の場合、エラーを投げる', () => {
    expect(() => parseCode('10')).toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
    expect(() => parseCode('100-00012')).toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
    expect(() => parseCode('abc-0001')).toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
    expect(() => parseCode('')).toThrowErrorMatchingInlineSnapshot(
      `[Error: 無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。]`
    )
  })
})

//
// search のテスト
//
describe('search', () => {
  test('lookup 結果から、area 部分に合致する住所を結合して返す', async () => {
    const results = await search('100')
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "city": "千代田区",
          "pref": "東京都",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
        },
        {
          "city": "丸の内",
          "pref": "東京都",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
          "town": "内幸町",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
          "town": "日比谷公園",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
          "town": "霞が関（次のビルを除く）",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
          "town": "永田町（次のビルを除く）",
        },
        {
          "city": "三宅島三宅村",
          "pref": "東京都",
        },
        {
          "city": "三宅島三宅村",
          "pref": "東京都",
          "town": "神着",
        },
      ]
    `)
  })

  test('lookup 結果から、local 部分に合致する住所を結合して返す', async () => {
    const results = await search('100-000')
    expect(results).toMatchInlineSnapshot(`
      [
        {
          "city": "千代田区",
          "pref": "東京都",
        },
        {
          "city": "千代田区",
          "pref": "東京都",
        },
        {
          "city": "丸の内",
          "pref": "東京都",
        },
      ]
    `)
  })

  test('local 部分に合致する住所が存在しない場合、空配列を返す', async () => {
    const results = await search('100-9999')
    expect(results).toEqual([])
  })
})
