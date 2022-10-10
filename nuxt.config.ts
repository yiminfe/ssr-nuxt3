// https://v3.nuxtjs.org/api/configuration/nuxt-config
import fs from 'node:fs'
import path from 'node:path'
import ElementPlus from 'unplugin-element-plus/vite'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'

const isProd = process.env.NODE_ENV === 'production'

const vitePlugins = []
const viteDefine: any = {}
if (isProd) {
  vitePlugins.push(
    ElementPlus(),
    visualizer({
      emitFile: true,
      gzipSize: true,
      brotliSize: true
    }) as any,
    viteCompression({
      algorithm: 'brotliCompress'
    }),
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false
      },
      optipng: {
        optimizationLevel: 7
      },
      mozjpeg: {
        quality: 20
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox'
          },
          {
            name: 'removeEmptyAttrs',
            active: false
          }
        ]
      }
    })
  )
} else {
  viteDefine.__VUE_I18N_FULL_INSTALL__ = true
  viteDefine.__VUE_I18N_LEGACY_API__ = false
  viteDefine.__INTLIFY_PROD_DEVTOOLS__ = false
}

export default defineNuxtConfig({
  app: {
    keepalive: true,
    head: {
      charset: 'utf-8',
      htmlAttrs: {
        lang: 'zh'
      },
      meta: [
        // <meta name="viewport" content="width=device-width, initial-scale=1">
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'theme-color',
          content: '#ffffff'
        }
      ],
      link: [
        // <link rel="stylesheet" href="https://myawesome-lib.css">
        { rel: 'icon', href: '/favicon.ico' },
        { rel: 'mask-icon', href: '/logo.svg', color: '#FFFFFF' },
        { rel: 'apple-touch-icon', href: '/logo.svg', sizes: '180x180' },
        { rel: 'manifest', href: '/manifest.webmanifest' }
      ]
    }
  },
  typescript: {
    shim: false
  },
  imports: {
    dirs: ['composables/**']
  },
  build: {
    quiet: false
  },
  hooks: {
    'build:manifest': manifest => {
      const manifestFilePath = path.join('manifest.json')
      fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2))
    }
  },
  experimental: {
    inlineSSRStyles: false
  },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      sourcemap: true,
      manifest: true
    },
    define: viteDefine,
    plugins: vitePlugins,
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@import "@/assets/scss/variable.scss";@import "@/assets/scss/main.scss";'
        }
      }
    },
    server: {
      proxy: {
        '/release': {
          target: 'https://ssr.yiminfe.com',
          rewrite: path => path.replace(/^\/release/, ''),
          changeOrigin: true
        }
      }
    }
  }
})
