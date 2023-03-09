import { _ as xn } from '../server.mjs';
import { defineComponent, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
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

const i = "" + globalThis.__buildAssetsURL("banner.d75e2f5e.jpg"), c = defineComponent({ __name: "index", __ssrInlineRender: true, setup: (s2) => (s3, m2, c2, u2) => {
  const a = xn;
  m2(`<div${ssrRenderAttrs(mergeProps({ class: "home-page" }, u2))}><div class="banner" style="${ssrRenderStyle({ backgroundImage: `url(${unref(i)})` })}"></div><div class="main-wapper"><h2 class="title">${ssrInterpolate(s3.$t("home.h2Title"))}</h2><p class="sub-title">${ssrInterpolate(s3.$t("home.subTitle"))}</p>`), m2(ssrRenderComponent(a, null, null, c2)), m2("</div></div>");
} }), u = c.setup;
c.setup = (e2, s2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("pages/index.vue"), u ? u(e2, s2) : void 0;
};

export { c as default };
//# sourceMappingURL=index.37b844e0.mjs.map
