import { defineComponent, ref, getCurrentInstance, mergeProps, useSSRContext } from 'vue';
import { c as it, h as un, i as Fn } from '../server.mjs';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
import 'ohmyfetch';
import 'ufo';
import 'hookable';
import 'unctx';
import 'vue-router';
import 'destr';
import 'h3';
import 'defu';
import '@vue/shared';
import 'element-plus';
import '@element-plus/icons-vue';
import 'cookie-es';
import 'ohash';
import 'vue-i18n';
import '../../nitro/node-server.mjs';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'scule';
import 'unstorage';
import 'fs';
import 'pathe';
import 'url';
import 'etag';

const a = defineComponent({ __name: "OrderPopover", __ssrInlineRender: true, emits: ["handleClose"], setup(e2, { expose: n2, emit: l2 }) {
  const a2 = ref([]);
  it();
  const { proxy: d2 } = getCurrentInstance();
  return n2({ refresh: function() {
    un().then((e3) => {
      const { result: s2, success: t2, message: o2 } = e3;
      t2 ? a2.value = s2 : d2.$message.error(o2);
    });
  } }), (e3, s2, t2, n3) => {
    a2.value.length > 0 ? (s2(`<ul${ssrRenderAttrs(n3)} data-v-71f16a82><!--[-->`), ssrRenderList(a2.value, (t3, o2) => {
      s2(`<li data-v-71f16a82><img${ssrRenderAttr("src", t3.pictureUrl)} loading="lazy" data-v-71f16a82><div class="mess" data-v-71f16a82><p class="title" data-v-71f16a82>${ssrInterpolate(t3.title)}</p><p class="info" data-v-71f16a82> \xA5${ssrInterpolate(t3.price)}/${ssrInterpolate(e3.$t("detail.night"))} \xB7 ${ssrInterpolate(t3.personNumber)}${ssrInterpolate(e3.$t("detail.person"))}</p></div></li>`);
    }), s2("<!--]--></ul>")) : s2(`<div${ssrRenderAttrs(mergeProps({ class: "loading-block" }, n3))} data-v-71f16a82>${ssrInterpolate(e3.$t("common.empty"))}</div>`);
  };
} }), d = a.setup;
a.setup = (e2, s2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("components/order/OrderPopover.vue"), d ? d(e2, s2) : void 0;
};
const y = Fn(a, [["__scopeId", "data-v-71f16a82"]]);

export { y as default };
//# sourceMappingURL=OrderPopover.0a0316e5.mjs.map
