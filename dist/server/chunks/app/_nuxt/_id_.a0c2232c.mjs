import { u as ct, a as ln, b as un, s as gn } from '../server.mjs';
import { defineComponent, withAsyncContext, watchEffect, reactive, getCurrentInstance, ref, resolveComponent, unref, withCtx, openBlock, createBlock, Fragment, renderList, createVNode, createTextVNode, toDisplayString, withDirectives, vModelSelect, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
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

const x = defineComponent({ __name: "[id]", __ssrInlineRender: true, async setup(r2) {
  let B2, x2;
  const R2 = ct(), { id: N } = R2.params, Q = { id: N }, { data: S, refresh: O } = ([B2, x2] = withAsyncContext(() => ln(Q)), B2 = await B2, x2(), B2);
  watchEffect(() => {
    const { result: e2 } = S.value;
    R2.meta.title = e2.title;
    const A2 = e2.owner || {};
    R2.meta.keywords = A2.introduce || "", R2.meta.description = A2.introduce || "";
  });
  const M = reactive({ personNumber: 1 }), { proxy: I } = getCurrentInstance(), { visible: J, showToast: V } = function() {
    const e2 = ref(false);
    let A2;
    return { visible: e2, showToast: function(s2) {
      e2.value = true, clearTimeout(A2), A2 = setTimeout(() => {
        e2.value = false;
      }, s2);
    } };
  }(), { checkLogin: z } = un();
  function L() {
    z() && function() {
      const { id: e2 } = R2.params, { title: A2, price: s2, imgs: l2 } = S.value.result, { personNumber: r3 } = M, o2 = { orderId: e2, title: A2, price: s2, personNumber: r3, pictureUrl: l2[0] };
      gn(o2).then((e3) => {
        const { success: A3, message: s3 } = e3;
        A3 ? V(1500) : I.$message.error(s3);
      });
    }();
  }
  return (e2, A2, s2, t2) => {
    const l2 = resolveComponent("el-carousel"), r3 = resolveComponent("el-carousel-item"), o2 = resolveComponent("el-tag"), n2 = resolveComponent("el-form"), i2 = resolveComponent("el-form-item"), a2 = resolveComponent("el-button");
    A2(`<div${ssrRenderAttrs(t2)}>`), unref(S).result && unref(S).result.info && unref(S).result.owner ? (A2("<div>"), unref(S).result.imgs && unref(S).result.imgs.length > 0 ? A2(ssrRenderComponent(l2, { class: "imgs-wall", trigger: "click", height: "380px", interval: 3e3, "indicator-position": "none", type: "card" }, { default: withCtx((e3, A3, s3, t3) => {
      if (!A3)
        return [(openBlock(true), createBlock(Fragment, null, renderList(unref(S).result.imgs, (e4, A4) => (openBlock(), createBlock(r3, { key: A4 }, { default: withCtx(() => [createVNode("img", { src: e4, loading: "lazy" }, null, 8, ["src"])]), _: 2 }, 1024))), 128))];
      A3("<!--[-->"), ssrRenderList(unref(S).result.imgs, (e4, l3) => {
        A3(ssrRenderComponent(r3, { key: l3 }, { default: withCtx((A4, s4, t4, l4) => {
          if (!s4)
            return [createVNode("img", { src: e4, loading: "lazy" }, null, 8, ["src"])];
          s4(`<img${ssrRenderAttr("src", e4)} loading="lazy"${l4}>`);
        }), _: 2 }, s3, t3));
      }), A3("<!--]-->");
    }), _: 1 }, s2)) : A2("<!---->"), A2(`<div class="main-wapper"><div class="room-detail"><div class="detail-part"><h2>${ssrInterpolate(unref(S).result.title)}</h2><div class="info"><span class="room" style="${ssrRenderStyle({ backgroundImage: `url(${unref("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAXlJREFUWEftlrtKxUAQhr9TCDZWamslKNjbCF5KGyu1Vbwd8R1EBZ9BQVAEO7VQC7Xz0ljZiOID2FjY+ATKyCwclmwyyRK2MAuBJDuz8+Xfmdm0SDxaiePTAMQo0A2cwJ+K68BXle2sCtCrwac16JNCvJSFqAIwAFwDI16wD2ANuC0DYQE4BfqBe+ASeAR6coIsA0dWCAvAjy4mAJPGhTeBXYttGQDLep02B0C7yKlOAIl9AywBnyGQPIAh4BAYK/qKgvlXYBF4zrILAcxo8D51egPOgQl9fgBmMyohxPKtEBe+QQhAMn+uw3gH2NZLXrv7rRLqnAHzVgBn5ypAnPeBBZ04BjY8yDyW4FYXJaEDkNoX2Ye1J7yr/ONGBaIBYrcgGiA2CaMBLEpLp/SH65y1A0h2S6L6407bd+0AU3pYNQBOgS5tOiuptmAQWAVGUwE4Jf5PEkoJ7mWU4ZX+vlUuQyehpRGFbKRBSZlmjqLDKCawybcBSK7AL+VMTiGuwU6rAAAAAElFTkSuQmCC")})` })}">${ssrInterpolate(unref(S).result.info.room)} ${ssrInterpolate(e2.$t("detail.rooms"))}</span><span class="bed" style="${ssrRenderStyle({ backgroundImage: `url(${unref("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAM1BMVEUAAAArKyssLCwrKyssLCwsLCwqKiosLCwsLCwsLCwrKysrKysqKiorKyssLCwqKiosLCykOYpzAAAAEHRSTlMAQL+wgHxO7dDFmUc8OyMYpYHK+AAAAE5JREFUOMvNyjkOgDAMBEAH24Rw7v9fCyUSJttFnnokCTQWMCK4eemFGQ9lAc7C8h/OSsJWvq5XiOlBArCz0FioLCBVkNA0MKwWB1PJ4QbQRhIe1hyZ9wAAAABJRU5ErkJggg==")})` })}">${ssrInterpolate(unref(S).result.info.bed)} ${ssrInterpolate(e2.$t("detail.beds"))}</span><span class="toilet" style="${ssrRenderStyle({ backgroundImage: `url(${unref("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAV1BMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOl5NtAAAAHHRSTlMAgFPnmEEzGty/urRoTCPy1K2fno6EfF5cOR8SDk0p1gAAAIpJREFUOMvVktkKwyAQADdRcye97/n/7yzYUjRslj6UQuZ1xgNd+SvleefYlku67nhR6/4C7jBM4hhVH+AYl7YUmn/A+2yvB3ta+/5sKjM44cWk52oHjrsdgO1Z5NtADP+roEGl+QQejeR5K1SS/xlQyIZv7JnRTZJyIx+UYrZBGb1VhOizIsh6eAJGix5OcSOX9QAAAABJRU5ErkJggg==")})` })}">${ssrInterpolate(unref(S).result.info.toilet)} ${ssrInterpolate(e2.$t("detail.bathrooms"))}</span><span class="live-number" style="${ssrRenderStyle({ backgroundImage: `url(${unref("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAhFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD8qm6wAAAAK3RSTlMAgDPAmtzUk2RBO/blzLeylndwSSokHBQJ8evQrqqfjoeFbFpVGcqmo2ogrZuJLAAAAORJREFUOMu90clugzAURuHfEIaQEQKBDM2cTuf936/UjSzVQLup+i28uUeydK/+VHqIN3ujIdUcK17pLVCPEQ8zZYSZfAFO2sbbSp4LzosKWHZ/cCJdIZZnjjPR+PPxJDjPymEnzw3npD0k8qxxSk1hJd+Zh5EKeFVHM+NLUEeQqeuEtZMBanWNsQ5aAIG6nrAWej/C5lz5t3CrTO4K2niyXHtjZ2ruSmPY3twOjnw3zdXkuGWMIzrCRheIajunV6AlXNUK6VeWYCRlDEg0s0HBgLmMDQwDQhmjnwPr9yBlwEL/5ANMnUrNUcmq0wAAAABJRU5ErkJggg==")})` })}">${ssrInterpolate(e2.$t("detail.living"))} ${ssrInterpolate(unref(S).result.info.liveNumber)} ${ssrInterpolate(e2.$t("detail.personNumber"))}</span></div><div class="tags">`), A2(ssrRenderComponent(o2, { size: "small" }, { default: withCtx((A3, s3, t3, l3) => {
      if (!s3)
        return [createTextVNode(toDisplayString(unref(S).result.info.remarks) + " " + toDisplayString(e2.$t("detail.remarks")), 1)];
      s3(`${ssrInterpolate(unref(S).result.info.remarks)} ${ssrInterpolate(e2.$t("detail.remarks"))}`);
    }), _: 1 }, s2)), unref(S).result.info.metro ? A2(ssrRenderComponent(o2, { size: "small", class: "ml-10", type: "danger" }, { default: withCtx((A3, s3, t3, l3) => {
      if (!s3)
        return [createTextVNode(toDisplayString(e2.$t("detail.nearSubway")), 1)];
      s3(`${ssrInterpolate(e2.$t("detail.nearSubway"))}`);
    }), _: 1 }, s2)) : A2("<!---->"), unref(S).result.info.parking ? A2(ssrRenderComponent(o2, { size: "small", class: "ml-10", type: "warning" }, { default: withCtx((A3, s3, t3, l3) => {
      if (!s3)
        return [createTextVNode(toDisplayString(e2.$t("detail.freeParking")), 1)];
      s3(`${ssrInterpolate(e2.$t("detail.freeParking"))}`);
    }), _: 1 }, s2)) : A2("<!---->"), unref(S).result.info.luggage ? A2(ssrRenderComponent(o2, { size: "small", class: "ml-10", type: "success" }, { default: withCtx((A3, s3, t3, l3) => {
      if (!s3)
        return [createTextVNode(toDisplayString(e2.$t("detail.luggage")), 1)];
      s3(`${ssrInterpolate(e2.$t("detail.luggage"))}`);
    }), _: 1 }, s2)) : A2("<!---->"), A2(`</div><hr><div class="owner-detail"><img${ssrRenderAttr("src", unref(S).result.owner.avatar)} loading="lazy"><div class="info"><p>${ssrInterpolate(e2.$t("detail.landlord"))}\uFF1A${ssrInterpolate(unref(S).result.owner.name)}</p><p>`), unref(S).result.owner.certify ? A2(`<span>${ssrInterpolate(e2.$t("detail.authenticated"))}</span>`) : A2("<!---->"), unref(S).result.info.goodOwner ? A2(`<span>${ssrInterpolate(e2.$t("detail.greatlandlord"))}</span>`) : A2("<!---->"), A2(`</p></div></div><div class="introduce">${ssrInterpolate(unref(S).result.owner.introduce || "")}</div></div><div class="form-part"><p class="price"><span>\xA5${ssrInterpolate(unref(S).result.price)}</span> / ${ssrInterpolate(e2.$t("detail.night"))}</p>`), A2(ssrRenderComponent(n2, { model: unref(M), "label-position": "top", class: "order-ruleForm" }, { default: withCtx((A3, s3, t3, l3) => {
      if (!s3)
        return [createVNode(i2, { prop: "personNumber", label: e2.$t("detail.personNumber") }, { default: withCtx(() => [withDirectives(createVNode("select", { "onUpdate:modelValue": (e3) => unref(M).personNumber = e3 }, [(openBlock(), createBlock(Fragment, null, renderList(3, (e3) => createVNode("option", { value: e3, key: e3 }, toDisplayString(e3), 9, ["value"])), 64))], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(M).personNumber]])]), _: 1 }, 8, ["label"]), createVNode(i2, null, { default: withCtx(() => [createVNode(a2, { class: "btn-primary", type: "primary", onClick: L }, { default: withCtx(() => [createTextVNode(toDisplayString(e2.$t("detail.order")), 1)]), _: 1 })]), _: 1 })];
      s3(ssrRenderComponent(i2, { prop: "personNumber", label: e2.$t("detail.personNumber") }, { default: withCtx((e3, A4, s4, t4) => {
        if (!A4)
          return [withDirectives(createVNode("select", { "onUpdate:modelValue": (e4) => unref(M).personNumber = e4 }, [(openBlock(), createBlock(Fragment, null, renderList(3, (e4) => createVNode("option", { value: e4, key: e4 }, toDisplayString(e4), 9, ["value"])), 64))], 8, ["onUpdate:modelValue"]), [[vModelSelect, unref(M).personNumber]])];
        A4(`<select${t4}><!--[-->`), ssrRenderList(3, (e4) => {
          A4(`<option${ssrRenderAttr("value", e4)}${t4}>${ssrInterpolate(e4)}</option>`);
        }), A4("<!--]--></select>");
      }), _: 1 }, t3, l3)), s3(ssrRenderComponent(i2, null, { default: withCtx((A4, s4, t4, l4) => {
        if (!s4)
          return [createVNode(a2, { class: "btn-primary", type: "primary", onClick: L }, { default: withCtx(() => [createTextVNode(toDisplayString(e2.$t("detail.order")), 1)]), _: 1 })];
        s4(ssrRenderComponent(a2, { class: "btn-primary", type: "primary", onClick: L }, { default: withCtx((A5, s5, t5, l5) => {
          if (!s5)
            return [createTextVNode(toDisplayString(e2.$t("detail.order")), 1)];
          s5(`${ssrInterpolate(e2.$t("detail.order"))}`);
        }), _: 1 }, t4, l4));
      }), _: 1 }, t3, l3));
    }), _: 1 }, s2)), A2("</div></div></div></div>")) : A2("<!---->"), A2("</div>");
  };
} }), R = x.setup;
x.setup = (e2, A2) => {
  const s2 = useSSRContext();
  return (s2.modules || (s2.modules = /* @__PURE__ */ new Set())).add("pages/detail/[id].vue"), R ? R(e2, A2) : void 0;
};

export { x as default };
//# sourceMappingURL=_id_.a0c2232c.mjs.map
