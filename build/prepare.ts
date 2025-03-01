import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

async function build() {
  const basePath = fileURLToPath(new URL('../', import.meta.url))

  const dataDir = path.join(basePath, 'data')
  const assetsDir = path.join(basePath, 'assets')
  const bucketDir = path.join(assetsDir, 'bucket')
  const mapDir = path.join(assetsDir, 'map')

  await fs.rm(assetsDir, { recursive: true, force: true })

  await fs.mkdir(assetsDir, { recursive: true })
  await fs.mkdir(bucketDir, { recursive: true })
  await fs.mkdir(mapDir, { recursive: true })

  const entries = await fs.readdir(dataDir)
  const jsonFiles = entries.filter((file) => /^\d{3}\.json$/.test(file))

  const buckets: Record<string, string[]> = {}
  for (const file of jsonFiles) {
    const bucket = file[0]
    if (!buckets[bucket]) {
      buckets[bucket] = []
    }
    buckets[bucket].push(file)
  }

  let assetsIndexContent = 'const map = {\n'
  for (const bucket of Object.keys(buckets).sort()) {
    assetsIndexContent += `  '${bucket}': () => import('./map/${bucket}'),\n`
  }
  assetsIndexContent += '};\n\nexport default map;\n'
  await fs.writeFile(
    path.join(assetsDir, 'index.ts'),
    assetsIndexContent,
    'utf8'
  )

  for (const bucket of Object.keys(buckets).sort()) {
    const bucketMapPath = path.join(mapDir, `${bucket}.ts`)
    const bucketBucketDir = path.join(bucketDir, bucket)

    await fs.mkdir(bucketBucketDir, { recursive: true })

    let bucketContent = 'const areas = {\n'
    for (const file of buckets[bucket].sort()) {
      const area = file.replace('.json', '')
      bucketContent += `  '${area}': () => import('../bucket/${bucket}/${area}.json'),\n`
    }
    bucketContent += '};\n\nexport default areas;\n'
    await fs.writeFile(bucketMapPath, bucketContent, 'utf8')

    for (const file of buckets[bucket]) {
      const sourceFilePath = path.join(dataDir, file)
      const destFilePath = path.join(bucketBucketDir, file)
      await fs.copyFile(sourceFilePath, destFilePath)
    }
  }
}

build().catch((err) => {
  console.error(err)
  process.exit(1)
})
