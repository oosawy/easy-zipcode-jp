export type Address = {
  pref: string
  city: string
  town?: string
}

export const getAreaMap = async (areacode: string): Promise<Record<string, Address[]> | null> => {
  try {
    const { default: maps } = await import(`../assets`)
    const { default: bucket } = await maps[areacode.slice(0, 1)]()
    const { default: area } = await bucket[areacode]()
    return area
  } catch {
    return null
  }
}

export const lookup = async (input: string): Promise<Record<string, Address[]> | null> => {
  const areacode = parseCode(input).area
  return await getAreaMap(areacode)
}

export const search = async (input: string): Promise<Address[]> => {
  const { area, local } = parseCode(input)
  const map = (await lookup(area)) ?? {}
  const addresses = Object.entries(map)
    .filter(([key]) => key.startsWith(area + local))
    .flatMap(([, value]) => value)
  return addresses
}

export const resolve = async (input: string): Promise<Address[] | null> => {
  const { zip, complete } = parseCode(input)

  if (!complete) {
    throw new Error(
      '無効な郵便番号: resolve 関数は、100-0001 または 1000001 のような完全な郵便番号が必要です。'
    )
  }

  const area = await lookup(zip.slice(0, 3))
  return area?.[zip] ?? null
}

export const parseCode = (input: string) => {
  const match = input.match(/^(?<area>\d{3})-?(?<local>\d{0,4})$/)

  if (!match || !match.groups) {
    throw new Error(
      '無効な郵便番号: 郵便番号は、100-0001、1000001、または少なくとも 100 の形式に従う必要があります。'
    )
  }

  const { area, local } = match.groups

  const complete = local.length === 4

  if (complete) {
    return {
      area,
      local,
      zip: area + local,
      complete: true,
    } as const
  } else {
    return {
      area,
      local,
      zip: undefined,
      complete: false,
    } as const
  }
}
