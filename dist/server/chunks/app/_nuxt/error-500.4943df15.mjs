import { i as Yn, j as ht } from '../server.mjs';
import { mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import 'ohmyfetch';
import 'ufo';
import 'hookable';
import 'unctx';
import 'vue-router';
import 'destr';
import '../../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'ohash';
import 'unstorage';
import 'fs';
import 'pathe';
import 'url';
import 'etag';
import 'defu';
import '@vue/shared';
import 'element-plus';
import '@element-plus/icons-vue';
import 'cookie-es';
import 'vue-i18n';

const p = { __name: "error-500", __ssrInlineRender: true, props: { appName: { type: String, default: "Nuxt" }, version: { type: String, default: "" }, statusCode: { type: Number, default: 500 }, statusMessage: { type: String, default: "Server error" }, description: { type: String, default: "This page is temporarily unavailable." } }, setup(e2) {
  const o2 = e2;
  return ht({ title: `${o2.statusCode} - ${o2.statusMessage} | ${o2.appName}`, script: [], style: [{ children: '*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}' }] }), (t2, o3, p2, i2) => {
    o3(`<div${ssrRenderAttrs(mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, i2))} data-v-eabfe04e><div class="fixed -bottom-1/2 left-0 right-0 h-1/2 spotlight" data-v-eabfe04e></div><div class="max-w-520px text-center" data-v-eabfe04e><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-eabfe04e>${ssrInterpolate(e2.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-eabfe04e>${ssrInterpolate(e2.description)}</p></div></div>`);
  };
} }, i = p.setup;
p.setup = (e2, t2) => {
  const s2 = useSSRContext();
  return (s2.modules || (s2.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue"), i ? i(e2, t2) : void 0;
};
const l = Yn(p, [["__scopeId", "data-v-eabfe04e"]]);

export { l as default };
//# sourceMappingURL=error-500.4943df15.mjs.map
