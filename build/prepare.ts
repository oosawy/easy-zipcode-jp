import fs from 'fs/promises'
import path from 'path'
import { Address, fetchZipcodeMap } from './unzip'
import { fileURLToPath } from 'url'

async function prepare() {
  const zipcodeMap = await fetchZipcodeMap()

  const basePath = fileURLToPath(new URL('../', import.meta.url))

  const assetsDir = path.resolve(basePath, 'assets')
  const mapDir = path.join(assetsDir, 'map')
  const bucketDir = path.join(assetsDir, 'bucket')

  await fs.rm(assetsDir, { force: true, recursive: true })

  await fs.mkdir(mapDir, { recursive: true })
  await fs.mkdir(bucketDir, { recursive: true })

  const buckets: Record<string, Record<string, Record<string, Address[]>>> = {}

  for (const zip in zipcodeMap) {
    const addresses = zipcodeMap[zip]
    const bucket = zip[0]
    const area = zip.substring(0, 3)

    if (!buckets[bucket]) {
      buckets[bucket] = {}
    }
    if (!buckets[bucket][area]) {
      buckets[bucket][area] = {}
    }
    buckets[bucket][area][zip] = addresses
  }

  for (const bucket in buckets) {
    const bucketPath = path.join(bucketDir, bucket)
    await fs.mkdir(bucketPath, { recursive: true })
    const areas = buckets[bucket]
    for (const area in areas) {
      const jsonFilePath = path.join(bucketPath, `${area}.json`)
      const jsonContent = JSON.stringify(areas[area], null, 2)
      await fs.writeFile(jsonFilePath, jsonContent, 'utf-8')
    }
  }

  await fs.mkdir(mapDir, { recursive: true })
  for (const bucket in buckets) {
    const areas = buckets[bucket]
    const sortedAreaKeys = Object.keys(areas).sort()
    let mapTsContent = 'const areas = {\n'
    for (const area of sortedAreaKeys) {
      mapTsContent += `  '${area}': () => import('../bucket/${bucket}/${area}.json'),\n`
    }
    mapTsContent += [
      '} as Record<',
      '  string,',
      '  () => Promise<{',
      '    default: Record<string, { pref: string; city: string; town?: string }[]>',
      '  }>',
      '>\n',
      'export default areas;\n',
    ].join('\n')
    const mapTsPath = path.join(mapDir, `${bucket}.ts`)
    await fs.writeFile(mapTsPath, mapTsContent, 'utf-8')
  }

  let indexTsContent = 'const map = {\n'
  for (let i = 0; i <= 9; i++) {
    indexTsContent += `  '${i}': () => import('./map/${i}'),\n`
  }
  indexTsContent += [
    '} as Record<',
    '  string,',
    '  () => Promise<{',
    '    default: Record<',
    '      string,',
    '      () => Promise<{',
    '        default: Record<string, { pref: string; city: string; town?: string }[]>',
    '      }>',
    '    >',
    '  }>',
    '>\n',
    'export default map;\n',
  ].join('\n')
  const indexTsPath = path.join(assetsDir, 'index.ts')
  await fs.writeFile(indexTsPath, indexTsContent, 'utf-8')

  console.log('Assets generated successfully.')
}

prepare().catch((err) => {
  console.error('Error during preparation:', err)
  process.exit(1)
})
