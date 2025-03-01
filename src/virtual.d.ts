declare module 'virtual:zipcode' {
  import type { Address } from './internal'

  type Lazy<T> = () => Promise<T>
  type Module<T> = { default: T }

  type BucketCode = string
  type AreaCode = string
  type ZipCode = string

  const module: BucketRecord
  export default module

  type BucketRecord = Record<BucketCode, Lazy<Module<AreaRecord>>>

  type AreaRecord = Record<AreaCode, Lazy<Module<ZipCodes>>>

  type ZipCodes = Address[]
}
