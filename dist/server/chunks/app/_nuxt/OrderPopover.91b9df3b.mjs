import { defineComponent, ref, getCurrentInstance, unref, mergeProps, useSSRContext } from 'vue';
import { c as ut, h as hn, i as Yn } from '../server.mjs';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrInterpolate } from 'vue/server-renderer';
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

const d = defineComponent({ __name: "OrderPopover", __ssrInlineRender: true, emits: ["handleClose"], setup(e2, { expose: m2, emit: r2 }) {
  const d2 = ref([]);
  ut();
  const { proxy: y2 } = getCurrentInstance();
  return m2({ refresh: function() {
    hn().then((e3) => {
      const { result: s2, success: t2, message: o2 } = e3;
      t2 ? d2.value = s2 : y2.$message.error(o2);
    });
  } }), (e3, s2, t2, m3) => {
    unref(d2).length > 0 ? (s2(`<ul${ssrRenderAttrs(m3)} data-v-71f16a82><!--[-->`), ssrRenderList(unref(d2), (t3, o2) => {
      s2(`<li data-v-71f16a82><img${ssrRenderAttr("src", t3.pictureUrl)} loading="lazy" data-v-71f16a82><div class="mess" data-v-71f16a82><p class="title" data-v-71f16a82>${ssrInterpolate(t3.title)}</p><p class="info" data-v-71f16a82> \xA5${ssrInterpolate(t3.price)}/${ssrInterpolate(e3.$t("detail.night"))} \xB7 ${ssrInterpolate(t3.personNumber)}${ssrInterpolate(e3.$t("detail.person"))}</p></div></li>`);
    }), s2("<!--]--></ul>")) : s2(`<div${ssrRenderAttrs(mergeProps({ class: "loading-block" }, m3))} data-v-71f16a82>${ssrInterpolate(e3.$t("common.empty"))}</div>`);
  };
} }), y = d.setup;
d.setup = (e2, s2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("components/order/OrderPopover.vue"), y ? y(e2, s2) : void 0;
};
const v = Yn(d, [["__scopeId", "data-v-71f16a82"]]);

export { v as default };
//# sourceMappingURL=OrderPopover.91b9df3b.mjs.map
