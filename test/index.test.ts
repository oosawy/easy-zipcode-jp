import { describe, it, expect } from 'vitest'
import { lookup, resolve, parseAreaCode, parseZipCode } from '../src/internal'

describe('lookup', () => {
  it('should return correct data for a valid area code', async () => {
    const result = await lookup('100')
    expect(result).toBeDefined()
    expect(result?.length).toMatchInlineSnapshot(`466`)
    expect(result?.slice(0, 2)).toMatchInlineSnapshot(`
      [
        {
          "city": "千代田区",
          "other": "",
          "prefectures": "東京都",
          "zip": "1000000",
        },
        {
          "city": "千代田区",
          "other": "内幸町",
          "prefectures": "東京都",
          "zip": "1000011",
        },
      ]
    `)
  })

  it('should throw an error for a invalid area code', async () => {
    await expect(lookup('xyz')).rejects.toThrow()
  })

  it('should throw an error for a non-existent area code', async () => {
    const result = await lookup('008')
    expect(result).toBeNull()
  })
})

describe('resolve', () => {
  it('should return correct address for a valid zip code', async () => {
    const result = await resolve('100-0000')
    expect(result).toEqual({
      zip: '1000000',
      prefectures: '東京都',
      city: '千代田区',
      other: '',
    })
  })

  it('should return undefined for a non-existent zip code', async () => {
    const result = await resolve('100-9999')
    expect(result).toBeNull()
  })

  it('should throw an error for an invalid zip code format', async () => {
    await expect(resolve('abcd1234')).rejects.toThrow(
      'Invalid ZIP code format.'
    )
  })
})

describe('parseAreaCode', () => {
  it('should parse valid area codes', () => {
    expect(parseAreaCode('100')).toEqual({ area: '100' })
    expect(parseAreaCode('999')).toEqual({ area: '999' })
  })

  it('should throw an error for invalid area codes', () => {
    expect(() => parseAreaCode('12')).toThrow()
    expect(() => parseAreaCode('abcd')).toThrow()
  })
})

describe('parseZipCode', () => {
  it('should parse valid zip codes', () => {
    expect(parseZipCode('100-0001')).toEqual({
      area: '100',
      local: '0001',
      zip: '1000001',
    })
    expect(parseZipCode('2000002')).toEqual({
      area: '200',
      local: '0002',
      zip: '2000002',
    })
  })

  it('should throw an error for invalid zip codes', () => {
    expect(() => parseZipCode('12-3456')).toThrow()
    expect(() => parseZipCode('abcd1234')).toThrow()
  })
})
