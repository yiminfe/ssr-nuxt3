// import cors from 'cors'

// import { defineCorsEventHandler } from '@nozomuikuta/h3-cors'

// const allowlist = [
//   'http://localhost:3001',
//   'http://localhost:3300',
//   'http://localhost:5173'
// ]

// function corsAuth(req) {
//   console.log(req.headers.origin)
//   if (allowlist.indexOf(req.headers.origin) !== -1) {
//     return true
//   }
//   return false
// }

// const corsOptions = {
//   origin: function (origin) {
//     console.log('Origin:', origin)
//     if (allowlist.indexOf(origin) !== -1) {
//       return true
//     } else {
//       return false
//     }
//   }
//   // credentials: true
// }

// export default defineCorsEventHandler(corsOptions)

export default defineEventHandler(event => {
  const { res } = event
  // if (corsAuth(req)) {
  //   res.setHeader('Access-Control-Allow-Origin', '*')
  // }
  res.setHeader('Access-Control-Allow-Origin', '*')
})
