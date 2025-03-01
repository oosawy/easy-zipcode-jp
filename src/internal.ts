export type Address = {
  zip: string
  prefectures: string
  city: string
  other: string
}

export const getAreaMap = async (areaCode: string) => {
  const asRecord = <T extends Record<string, unknown>>(mappings: T) =>
    mappings as typeof mappings extends Record<string, infer U>
      ? Record<string, U>
      : never

  try {
    const { default: maps } = await import(`../assets`)
    const { default: bucket } = await asRecord(maps)[areaCode.slice(0, 1)]()
    const { default: area } = await asRecord(bucket)[areaCode]()
    return area
  } catch (err) {
    console.log(err)
    return null
  }
}

export const lookup = async (input: string): Promise<Address[] | null> => {
  const areaCode = parseAreaCode(input).area
  return await getAreaMap(areaCode)
}

export const resolve = async (input: string): Promise<Address | null> => {
  const zipCode = parseZipCode(input).zip

  const areaCode = zipCode.slice(0, 3)
  const area = await lookup(areaCode)

  return area?.find((address) => address.zip === zipCode) ?? null
}

export const parseAreaCode = (input: string) => {
  const match = input.match(/^(\d{3})$/)?.[0]

  if (match) return { area: match }

  throw new Error('Invalid Area code: It must follow the pattern: 100.')
}

export const parseZipCode = (input: string) => {
  const matches = input.match(/^(\d{3})-?(\d{4})$/)

  const [, area, local] = matches ?? []
  if (area && local) return { area, local, zip: area + local }

  throw new Error(
    'Invalid ZIP code: It must follow the pattern: 100-0001 or 1000001.'
  )
}
