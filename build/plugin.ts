import type { Plugin } from 'esbuild'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

export function virtualZipcodeModulePlugin(): Plugin {
  return {
    name: 'virtual-zipcode-module',
    setup(build) {
      build.onResolve({ filter: /^virtual:zipcode(\/.*?)*$/ }, (args) => {
        return { path: args.path, namespace: 'virtual-zipcode' }
      })

      build.onLoad({ filter: /.*/, namespace: 'virtual-zipcode' }, (args) => {
        const pathParts = args.path.split('/').slice(1)

        if (pathParts.length === 0) {
          return {
            contents: `
              const _1 = () => import('virtual:zipcode/1')
              const _2 = () => import('virtual:zipcode/2')
              export { _1 as '1', _2 as '2' }
            `,
            loader: 'ts',
          }
        }

        if (pathParts.length === 1) {
          if (pathParts[0] === '1') {
            return {
              contents: `
                const _100 = () => import('virtual:zipcode/1/100')
                const _101 = () => import('virtual:zipcode/1/101')
                export { _100 as '100', _102 as '102' }
              `,
              loader: 'ts',
            }
          }
          if (pathParts[0] === '2') {
            return {
              contents: `
                const _201 = () => import('virtual:zipcode/1/201')
                const _202 = () => import('virtual:zipcode/1/202')
                export { _201 as '201', _202 as '202' }
              `,
              loader: 'ts',
            }
          }
        }

        if (pathParts.length === 2) {
          const areaCode = pathParts[1]
          return fs
            .readFile(
              fileURLToPath(import.meta.resolve(`./assets/${areaCode}.json`)),
              'utf8'
            )
            .then((area) => ({
              contents: area,
              loader: 'ts',
            }))
        }

        return {
          contents: `throw new Error('Invalid virtual:zipcode import.')`,
          loader: 'ts',
        }
      })
    },
  }
}
