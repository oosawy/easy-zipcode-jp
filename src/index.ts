// export { type Address, lookup, resolve } from './internal'

// const zipcode = await import('virtual:zipcode')

import zipcode from 'virtual:zipcode'

console.log(zipcode)

const { default: bucket } = await zipcode['1']()
const { default: area } = await bucket['100']()

console.log(area)
