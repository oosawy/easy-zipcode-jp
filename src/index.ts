// export { type Address, lookup, resolve } from './internal'

const a = Math.random() ? 1 :1
const b = Math.random() ? 100 :100

console.log(await import(`virtual:zipcode/${a}/${b}`))

// import zipcode from 'virtual:zipcode'

// console.log(zipcode)

// const { default: bucket } = await zipcode['1']()
// const { default: area } = await bucket['100']()

// console.log(area)
