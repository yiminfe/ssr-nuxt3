import { i as Yn, j as ht, k as gt } from '../server.mjs';
import { mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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

const c = { __name: "error-404", __ssrInlineRender: true, props: { appName: { type: String, default: "Nuxt" }, version: { type: String, default: "" }, statusCode: { type: Number, default: 404 }, statusMessage: { type: String, default: "Not Found" }, description: { type: String, default: "Sorry, the page you are looking for could not be found." }, backHome: { type: String, default: "Go back home" } }, setup(e2) {
  const l2 = e2;
  return ht({ title: `${l2.statusCode} - ${l2.statusMessage} | ${l2.appName}`, script: [], style: [{ children: '*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, .5);--tw-ring-offset-shadow:0 0 #0000;--tw-ring-shadow:0 0 #0000;--tw-shadow:0 0 #0000}:root{-moz-tab-size:4;-o-tab-size:4;tab-size:4}a{color:inherit;text-decoration:inherit}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1.5}h1,p{margin:0}h1{font-size:inherit;font-weight:inherit}' }] }), (t2, l3, c2, u2) => {
    const d2 = gt;
    l3(`<div${ssrRenderAttrs(mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white grid min-h-screen place-content-center overflow-hidden" }, u2))} data-v-fa617d66><div class="fixed left-0 right-0 spotlight z-10" data-v-fa617d66></div><div class="max-w-520px text-center z-20" data-v-fa617d66><h1 class="text-8xl sm:text-10xl font-medium mb-8" data-v-fa617d66>${ssrInterpolate(e2.statusCode)}</h1><p class="text-xl px-8 sm:px-0 sm:text-4xl font-light mb-16 leading-tight" data-v-fa617d66>${ssrInterpolate(e2.description)}</p><div class="w-full flex items-center justify-center" data-v-fa617d66>`), l3(ssrRenderComponent(d2, { to: "/", class: "gradient-border text-md sm:text-xl py-2 px-4 sm:py-3 sm:px-6 cursor-pointer" }, { default: withCtx((t3, s2, o2, n2) => {
      if (!s2)
        return [createTextVNode(toDisplayString(e2.backHome), 1)];
      s2(`${ssrInterpolate(e2.backHome)}`);
    }), _: 1 }, c2)), l3("</div></div></div>");
  };
} }, u = c.setup;
c.setup = (e2, t2) => {
  const s2 = useSSRContext();
  return (s2.modules || (s2.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue"), u ? u(e2, t2) : void 0;
};
const d = Yn(c, [["__scopeId", "data-v-fa617d66"]]);

export { d as default };
//# sourceMappingURL=error-404.bb94ad16.mjs.map
