import './style.css'

import { search, lookup, resolve } from 'easy-zipcode-jp'

await new Promise(r => setTimeout(r, 5000))

// [
//   { city: '千代田区', pref: '東京都' },
//   { city: '千代田区', pref: '東京都' },
//   { city: '丸の内', pref: '東京都' },
//   ...
// ]
// console.log(await search('100-100'))

// {
//   1000000: [{ city: '千代田区', pref: '東京都' }],
//   1000001: [
//     { city: '千代田区', pref: '東京都' },
//     { city: '丸の内', pref: '東京都' },
//   ],
//   1000011: [{ city: '千代田区', pref: '東京都', town: '内幸町' }],
//   ...
// }
console.log(await lookup('100'))

// [
//   { city: '千代田区', pref: '東京都' },
//   { city: '丸の内', pref: '東京都' },
// ]
// console.log(await resolve('100-0001'))
