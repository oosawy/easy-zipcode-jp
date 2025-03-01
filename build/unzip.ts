import { parse } from 'csv/sync'
import iconv from 'iconv-lite'
import AdmZip from 'adm-zip'

const KEN_ALL =
  'https://www.post.japanpost.jp/zipcode/dl/oogaki/zip/ken_all.zip'

interface Address {
  pref: string
  city: string
  town?: string
}

const parseRow = (row: string[]): Address => {
  const pref = row[6].trim()
  const city = row[7].trim()
  const rawTown = row[8].trim()

  const town = rawTown === '以下に掲載がない場合' ? undefined : rawTown

  return { pref, city, town }
}

export const fetchZipcodeMap = async (
  zipUrl: string = KEN_ALL
): Promise<Record<string, Address[]>> => {
  const response = await fetch(zipUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  const zip = new AdmZip(buffer)
  const csvDataBuffer = zip.getEntries()[0].getData()
  const csvData = iconv.decode(csvDataBuffer, 'Shift_JIS')
  const rows: string[][] = parse(csvData)

  const result: Record<string, Address[]> = {}
  for (const row of rows) {
    const zipCode = row[2].trim()
    if (!zipCode) continue
    const addr = parseRow(row)
    if (!result[zipCode]) {
      result[zipCode] = []
    }
    result[zipCode].push(addr)
  }
  return result
}

console.log(await fetchZipcodeMap())
