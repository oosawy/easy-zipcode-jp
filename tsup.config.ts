import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'esnext',
  dts: true,
  minify: true,
  clean: true,
  tsconfig: 'tsconfig.lib.json',
})
