// https://v3.nuxtjs.org/api/configuration/nuxt-config
import fs from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
// import ElementPlus from 'unplugin-element-plus/webpack'
import ElementPlus from 'unplugin-element-plus/vite'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import { visualizer } from 'rollup-plugin-visualizer'
// import qiankun from 'vite-plugin-qiankun'
// import CompressionPlugin from 'compression-webpack-plugin'
// import ImageMinimizerPlugin from 'image-minimizer-webpack-plugin'

const isProd = process.env.NODE_ENV === 'production'
const CDN_URL = isProd ? 'https://static.yiminfe.com/nuxt-ssr' : ''

const vitePlugins: any[] = []
const viteDefine: any = {}
if (isProd) {
  vitePlugins.push(
    // qiankun('nuxt-ssr'),
    visualizer({
      emitFile: true,
      gzipSize: true,
      brotliSize: true
    }),
    // legacy({
    //   targets: ['> 100%']
    //   // modernPolyfills: ['modules'],
    //   // renderLegacyChunks: false
    // }),
    // babel({
    //   babelConfig: {
    //     babelrc: false,
    //     configFile: false,
    //     plugin: []
    //   }
    // }),
    ElementPlus(),
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
  builder: 'vite',
  app: {
    // baseURL: '/nuxt-ssr',
    keepalive: true,
    cdnURL: CDN_URL,
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
        {
          rel: 'icon',
          href: `${CDN_URL}/favicon.ico`
        },
        {
          rel: 'mask-icon',
          href: `${CDN_URL}/logo.svg`,
          color: '#FFFFFF'
        },
        {
          rel: 'apple-touch-icon',
          href: `${CDN_URL}/logo.svg`,
          sizes: '180x180'
        },
        {
          rel: 'manifest',
          href: `${CDN_URL}/manifest.webmanifest`
        }
      ]
      // script: [
      //   // <script src="https://myawesome-lib.js"></script>
      //   { src: `${CDN_URL}/public-path.js` }
      // ]
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
    // transpile: ['element-plus/es']
  },
  hooks: {
    'build:manifest': manifest => {
      const manifestFilePath = path.join('server', 'manifest.json')
      fs.writeFileSync(manifestFilePath, JSON.stringify(manifest, null, 2))
    }
  },
  experimental: {
    inlineSSRStyles: false
  },
  vite: {
    // base: 'http://localhost:3300/',
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      sourcemap: true
      //   plugins: [
      //     vue(),
      //     terser(),
      //     postcss({
      //       plugins: [autoprefixer(), cssnano()],
      //       extract: 'bundle.css'
      //     })
      //     // scss({
      //     //   processor: () => postcss([autoprefixer()]) as any,
      //     //   prefix:
      //     //     '@import "@/assets/scss/variable.scss";@import "@/assets/scss/main.scss";'
      //     // })
      //   ]
      // }
    },
    define: viteDefine,
    plugins: vitePlugins,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData:
            '@import "@/assets/scss/variable.scss";@import "@/assets/scss/main.scss";'
        }
      }
    }
    // ssr: {
    //   noExternal: ['terser', 'legacy-generate-polyfill-chunk']
    // },
    // server: {
    //   proxy: {
    //     '/release': {
    //       target: 'https://nuxt.yiminfe.com',
    //       rewrite: path => path.replace(/^\/release/, ''),
    //       changeOrigin: true
    //     }
    //   }
    // }
  }
  // webpack: {
  //   loaders: {
  //     scss: {
  //       additionalData:
  //         '@import "@/assets/scss/variable.scss";@import "@/assets/scss/main.scss";'
  //     }
  //   },
  //   plugins: [
  //     ElementPlus(),
  //     new CompressionPlugin({
  //       filename: '[path][base].br',
  //       algorithm: 'brotliCompress',
  //       test: /\.(js|css|html|svg)$/,
  //       compressionOptions: {
  //         level: 11
  //       },
  //       deleteOriginalAssets: false
  //     })
  //   ],
  //   optimization: {
  //     usedExports: true,
  //     minimizer: [
  //       new ImageMinimizerPlugin({
  //         minimizer: {
  //           implementation: ImageMinimizerPlugin.imageminMinify,
  //           options: {
  //             plugins: [['jpegtran', { progressive: true }]]
  //           },
  //           // Only apply this one to files equal to or over 8192 bytes
  //           filter: source => {
  //             if (source.byteLength >= 8192) {
  //               return true
  //             }
  //             return false
  //           }
  //         }
  //       })
  //     ]
  //   }
  // }
})
