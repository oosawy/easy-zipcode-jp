import type { Plugin } from 'esbuild'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

async function listBuckets(basePath: string) {
  const entries = await fs.readdir(basePath)
  const files = entries.filter((file) => /^\d{3}\.json$/.test(file))

  const buckets: Record<string, string[]> = {}

  for (const file of files) {
    const bucket = file[0]
    const area = path.basename(file, '.json')

    if (!buckets[bucket]) {
      buckets[bucket] = []
    }
    buckets[bucket].push(area)
  }

  return buckets
}

export function virtualZipcodeModulePlugin(): Plugin {
  return {
    name: 'virtual-zipcode-module',
    async setup(build) {
      const assetsDir = fileURLToPath(new URL('../assets', import.meta.url))
      const buckets = await listBuckets(assetsDir)

      build.onResolve({ filter: /^virtual:zipcode(\/.*?)*$/ }, (args) => {
        return { path: args.path, namespace: 'virtual-zipcode' }
      })

      build.onLoad(
        { filter: /.*/, namespace: 'virtual-zipcode' },
        async (args) => {
          const pathParts = args.path.split('/').slice(1)

          if (pathParts.length === 0) {
            const bucketNames = Object.keys(buckets)
            const imports = bucketNames
              .map(
                (bucket) =>
                  `'${bucket}': () => import('virtual:zipcode/${bucket}')`
              )
              .join(',\n')

            return {
              contents: `export default { ${imports} }`,
              loader: 'ts',
            }
          }

          if (pathParts.length === 1) {
            const bucket = pathParts[0]

            if (!buckets[bucket]) {
              return {
                contents: `throw new Error('Invalid virtual:zipcode/${bucket} import.')`,
                loader: 'ts',
              }
            }

            const codes = buckets[bucket]
              .map(
                (area) =>
                  `'${area}': () => import('virtual:zipcode/${bucket}/${area}')`
              )
              .join(',\n')

            return {
              contents: `export default { ${codes} }`,
              loader: 'ts',
            }
          }

          if (pathParts.length === 2) {
            const area = pathParts[1]
            const jsonFilePath = fileURLToPath(import.meta.resolve(`./assets/${area}.json`))

            try {
              const areaData = await fs.readFile(jsonFilePath, 'utf8')
              return { contents: areaData, loader: 'json' }
            } catch {
              return {
                contents: `throw new Error('Zipcode data not found for ${args.path}.')`,
                loader: 'ts',
              }
            }
          }

          return {
            contents: `throw new Error('Invalid virtual:zipcode import.')`,
            loader: 'ts',
          }
        }
      )
    },
  }
}
