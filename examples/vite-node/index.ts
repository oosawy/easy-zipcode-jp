import { lookup, resolve } from 'easy-zipcode-jp'

console.log(await lookup('100'))

console.log(await resolve('100-0001'))
