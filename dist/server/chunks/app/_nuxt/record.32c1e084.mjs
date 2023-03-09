import { defineComponent, ref, getCurrentInstance, resolveComponent, mergeProps, withCtx, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { c as it } from '../server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
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

const x = defineComponent({ __name: "record", __ssrInlineRender: true, setup(e2) {
  const a2 = ref();
  getCurrentInstance();
  const x2 = it(), f2 = ref(true);
  return (e3, s2, t2, d2) => {
    const k = resolveComponent("el-skeleton"), w = resolveComponent("el-skeleton-item"), $ = resolveComponent("el-image"), b = resolveComponent("el-empty");
    s2(`<div${ssrRenderAttrs(mergeProps({ class: "record-page" }, d2))}><div class="main-wrapper">`), s2(ssrRenderComponent(k, { loading: f2.value, animated: "" }, { template: withCtx((e4, s3, t3, l2) => {
      if (!s3)
        return [createVNode("div", { class: "column-style" }, [(openBlock(), createBlock(Fragment, null, renderList(9, (e5) => createVNode("div", { class: "item", key: e5 }, [createVNode(w, { variant: "image", style: { width: "315px", height: "240px", "border-radius": "4px" } }), createVNode(w, { variant: "p", style: { width: "100%", "margin-top": "15px" } }), createVNode(w, { variant: "p", style: { width: "30%" } })])), 64))])];
      s3(`<div class="column-style"${l2}><!--[-->`), ssrRenderList(9, (e5) => {
        s3(`<div class="item"${l2}>`), s3(ssrRenderComponent(w, { variant: "image", style: { width: "315px", height: "240px", "border-radius": "4px" } }, null, t3, l2)), s3(ssrRenderComponent(w, { variant: "p", style: { width: "100%", "margin-top": "15px" } }, null, t3, l2)), s3(ssrRenderComponent(w, { variant: "p", style: { width: "30%" } }, null, t3, l2)), s3("</div>");
      }), s3("<!--]--></div>");
    }), default: withCtx((e4, s3, t3, l2) => {
      if (!s3)
        return [a2.value.length > 0 ? (openBlock(), createBlock("div", { key: 0, class: "column-style" }, [(openBlock(true), createBlock(Fragment, null, renderList(a2.value, (e5, s4) => (openBlock(), createBlock("div", { class: "item", key: s4, onClick: (s5) => function(e6) {
          const { recordId: s6 } = e6;
          x2.push(`/detail/${s6}`);
        }(e5) }, [createVNode($, { src: e5.pictureUrl, alt: e5.title, loading: "lazy" }, null, 8, ["src", "alt"]), createVNode("p", { class: "title" }, toDisplayString(e5.title), 1), createVNode("p", { class: "price" }, "\xA5" + toDisplayString(e5.price), 1)], 8, ["onClick"]))), 128))])) : (openBlock(), createBlock(b, { key: 1, description: "\u6682\u65E0\u6D4F\u89C8\u8BB0\u5F55\u54E6~" }))];
      a2.value.length > 0 ? (s3(`<div class="column-style"${l2}><!--[-->`), ssrRenderList(a2.value, (e5, o2) => {
        s3(`<div class="item"${l2}>`), s3(ssrRenderComponent($, { src: e5.pictureUrl, alt: e5.title, loading: "lazy" }, null, t3, l2)), s3(`<p class="title"${l2}>${ssrInterpolate(e5.title)}</p><p class="price"${l2}>\xA5${ssrInterpolate(e5.price)}</p></div>`);
      }), s3("<!--]--></div>")) : s3(ssrRenderComponent(b, { description: "\u6682\u65E0\u6D4F\u89C8\u8BB0\u5F55\u54E6~" }, null, t3, l2));
    }), _: 1 }, t2)), s2("</div></div>");
  };
} }), f = x.setup;
x.setup = (e2, s2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("pages/record.vue"), f ? f(e2, s2) : void 0;
};

export { x as default };
//# sourceMappingURL=record.32c1e084.mjs.map
