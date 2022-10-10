import createEtag from 'etag'
import manifest from '../../manifest.json'

const pages = [
  'pages/index.vue',
  'pages/login.vue',
  'pages/record.vue',
  'pages/detail/[id].vue'
]

function renderPagePrefetchLink(file: any) {
  const prefix = '_nuxt'
  if (file.endsWith('.js')) {
    return `<link rel="prefetch" as="script" crossorigin href="/${prefix}/${file}">`
  } else if (file.endsWith('.css')) {
    return `<link rel="prefetch" as="style" href="/${prefix}/${file}">`
  }
}

function renderLinks(modules: any) {
  console.log('manifest:', manifest)
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

const isProd = process.env.NODE_ENV === 'production'

export default defineEventHandler(event => {
  const { req, res } = event
  if (req.headers.accept?.indexOf('text/html') > -1) {
    const originalEnd = res.end
    res.end = html => {
      let newHtml = html
      if (isProd) {
        const prefetchLinks = renderLinks(pages)
        console.log('prefetchLinks', prefetchLinks)
        newHtml = newHtml.replace('</head>', `${prefetchLinks}</head>`)
      }
      res.setHeader('ETag', createEtag(newHtml))
      return originalEnd(newHtml)
    }
  }
})
