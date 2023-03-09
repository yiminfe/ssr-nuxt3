import { defineComponent, ref, getCurrentInstance, resolveComponent, mergeProps, unref, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { c as ut } from '../server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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

const f = defineComponent({ __name: "record", __ssrInlineRender: true, setup(e2) {
  const d2 = ref();
  getCurrentInstance();
  const f2 = ut(), k2 = ref(true);
  return (e3, s2, t2, y2) => {
    const w = resolveComponent("el-skeleton"), $ = resolveComponent("el-skeleton-item"), b = resolveComponent("el-image"), _ = resolveComponent("el-empty");
    s2(`<div${ssrRenderAttrs(mergeProps({ class: "record-page" }, y2))}><div class="main-wrapper">`), s2(ssrRenderComponent(w, { loading: unref(k2), animated: "" }, { template: withCtx((e4, s3, t3, l2) => {
      if (!s3)
        return [createVNode("div", { class: "column-style" }, [(openBlock(), createBlock(Fragment, null, renderList(9, (e5) => createVNode("div", { class: "item", key: e5 }, [createVNode($, { variant: "image", style: { width: "315px", height: "240px", "border-radius": "4px" } }), createVNode($, { variant: "p", style: { width: "100%", "margin-top": "15px" } }), createVNode($, { variant: "p", style: { width: "30%" } })])), 64))])];
      s3(`<div class="column-style"${l2}><!--[-->`), ssrRenderList(9, (e5) => {
        s3(`<div class="item"${l2}>`), s3(ssrRenderComponent($, { variant: "image", style: { width: "315px", height: "240px", "border-radius": "4px" } }, null, t3, l2)), s3(ssrRenderComponent($, { variant: "p", style: { width: "100%", "margin-top": "15px" } }, null, t3, l2)), s3(ssrRenderComponent($, { variant: "p", style: { width: "30%" } }, null, t3, l2)), s3("</div>");
      }), s3("<!--]--></div>");
    }), default: withCtx((e4, s3, t3, l2) => {
      if (!s3)
        return [unref(d2).length > 0 ? (openBlock(), createBlock("div", { key: 0, class: "column-style" }, [(openBlock(true), createBlock(Fragment, null, renderList(unref(d2), (e5, s4) => (openBlock(), createBlock("div", { class: "item", key: s4, onClick: (s5) => function(e6) {
          const { recordId: s6 } = e6;
          f2.push(`/detail/${s6}`);
        }(e5) }, [createVNode(b, { src: e5.pictureUrl, alt: e5.title, loading: "lazy" }, null, 8, ["src", "alt"]), createVNode("p", { class: "title" }, toDisplayString(e5.title), 1), createVNode("p", { class: "price" }, "\xA5" + toDisplayString(e5.price), 1)], 8, ["onClick"]))), 128))])) : (openBlock(), createBlock(_, { key: 1, description: "\u6682\u65E0\u6D4F\u89C8\u8BB0\u5F55\u54E6~" }))];
      unref(d2).length > 0 ? (s3(`<div class="column-style"${l2}><!--[-->`), ssrRenderList(unref(d2), (e5, o2) => {
        s3(`<div class="item"${l2}>`), s3(ssrRenderComponent(b, { src: e5.pictureUrl, alt: e5.title, loading: "lazy" }, null, t3, l2)), s3(`<p class="title"${l2}>${ssrInterpolate(e5.title)}</p><p class="price"${l2}>\xA5${ssrInterpolate(e5.price)}</p></div>`);
      }), s3("<!--]--></div>")) : s3(ssrRenderComponent(_, { description: "\u6682\u65E0\u6D4F\u89C8\u8BB0\u5F55\u54E6~" }, null, t3, l2));
    }), _: 1 }, t2)), s2("</div></div>");
  };
} }), k = f.setup;
f.setup = (e2, s2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("pages/record.vue"), k ? k(e2, s2) : void 0;
};

export { f as default };
//# sourceMappingURL=record.5ef24da5.mjs.map
