import createEtag from 'etag'
// @ts-ignore
import manifest from '@/server/manifest.json'

const isProd = process.env.NODE_ENV === 'production'
const CDN_URL = isProd ? 'https://static.yiminfe.com/nuxt-ssr' : ''

const pages = [
  'pages/index.vue',
  'pages/login.vue',
  'pages/record.vue',
  'pages/detail/[id].vue'
]

function renderPagePrefetchLink(file: any) {
  const prefix = '_nuxt'
  if (file.endsWith('.js')) {
    return `<link rel="prefetch" as="script" href="${CDN_URL}/${prefix}/${file}">`
  } else if (file.endsWith('.css')) {
    return `<link rel="prefetch" as="style" href="${CDN_URL}/${prefix}/${file}">`
  }
}

function renderLinks(modules: any) {
  let links = ''
  modules.forEach((id: any) => {
    const file = manifest[id]
    if (file) {
      links += renderPagePrefetchLink(file.file)
      const { css } = file
      for (const item of css) {
        links += renderPagePrefetchLink(item)
      }
    }
  })
  return links
}

function renderWorkboxUpdate() {
  return `<script>navigator&&navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',function(event){if(event.data.meta==='workbox-broadcast-update'){window.location.reload()}})</script>`
}

// function renderQianKun() {
//   return `<script src="${CDN_URL}/qiankun-entry.js" entry></script>`
// }

// function moduleToSystemJS(html: string) {
//   const newHtml = html.replace(/<script type="module"/g, '<script')
//   return newHtml
// }

// <link rel="preload" as="style"

export default defineEventHandler(event => {
  console.log('进入了interceptor中间件')
  const { res } = event
  // if (req.headers.accept?.indexOf('text/html') > -1) {
  const originalEnd = res.end
  res.end = html => {
    let newHtml = html
    if (isProd) {
      const prefetchLinks = renderLinks(pages)
      const workboxUpdate = renderWorkboxUpdate()
      newHtml = newHtml.replace(
        '</head>',
        `${prefetchLinks}${workboxUpdate}</head>`
      )
    }
    // newHtml = newHtml.replace('</body>', `${renderQianKun()}</body>`)
    res.setHeader('ETag', createEtag(newHtml))
    return originalEnd(newHtml)
  }
  // }
})
