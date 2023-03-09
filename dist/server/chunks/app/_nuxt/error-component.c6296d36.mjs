import { useSSRContext, defineAsyncComponent, unref, mergeProps } from 'vue';
import { ssrRenderComponent } from 'vue/server-renderer';

const o = { __name: "nuxt-error-page", __ssrInlineRender: true, props: { error: Object }, setup(s2) {
  var o2;
  const { error: a2 } = s2;
  (a2.stack || "").split("\n").splice(1).map((e2) => ({ text: e2.replace("webpack:/", "").replace(".vue", ".js").trim(), internal: e2.includes("node_modules") && !e2.includes(".cache") || e2.includes("internal") || e2.includes("new Promise") })).map((e2) => `<span class="stack${e2.internal ? " internal" : ""}">${e2.text}</span>`).join("\n");
  const u2 = Number(a2.statusCode || 500), d = 404 === u2, l = null != (o2 = a2.statusMessage) ? o2 : d ? "Page Not Found" : "Internal Server Error", p = a2.message || a2.toString(), i = defineAsyncComponent(() => import('./error-404.bb94ad16.mjs').then((e2) => e2.default || e2)), c = defineAsyncComponent(() => import('./error-500.4943df15.mjs').then((e2) => e2.default || e2)), m = d ? i : c;
  return (e2, s3, o3, a3) => {
    s3(ssrRenderComponent(unref(m), mergeProps({ statusCode: unref(u2), statusMessage: unref(l), description: unref(p), stack: unref(void 0) }, a3), null, o3));
  };
} }, a = o.setup;
o.setup = (e2, r2) => {
  const t2 = useSSRContext();
  return (t2.modules || (t2.modules = /* @__PURE__ */ new Set())).add("node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/components/nuxt-error-page.vue"), a ? a(e2, r2) : void 0;
};
const u = o;

export { u as default };
//# sourceMappingURL=error-component.c6296d36.mjs.map
