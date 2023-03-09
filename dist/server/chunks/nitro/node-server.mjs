globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { defineEventHandler, handleCacheHeaders, createEvent, eventHandler, createError, createApp, createRouter, lazyEventHandler } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ohmyfetch';
import { createRouter as createRouter$1 } from 'radix3';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { parseURL, withQuery, withLeadingSlash, withoutTrailingSlash, joinURL } from 'ufo';
import { createStorage } from 'unstorage';
import { promises } from 'fs';
import { dirname, resolve } from 'pathe';
import { fileURLToPath } from 'url';
import createEtag from 'etag';

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":"https://static.yiminfe.com/nuxt-ssr"},"nitro":{"routes":{},"envPrefix":"NUXT_"},"public":{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
function timingMiddleware(_req, res, next) {
  const start = globalTiming.start();
  const _end = res.end;
  res.end = (data, encoding, callback) => {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!res.headersSent) {
      res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(res, data, encoding, callback);
  };
  next();
}

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl;
    const _resolve = async () => {
      if (!pending[key]) {
        entry.value = void 0;
        entry.integrity = void 0;
        entry.mtime = void 0;
        entry.expires = void 0;
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      const url = event.req.originalUrl || event.req.url;
      const friendlyName = decodeURI(parseURL(url).pathname).replace(/[^a-zA-Z0-9]/g, "").substring(0, 16);
      const urlHash = hash(url);
      return `${friendlyName}.${urlHash}`;
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    event.context = incomingEvent.context;
    const body = await handler(event);
    const headers = event.res.getHeaders();
    headers.Etag = `W/"${hash(body)}"`;
    headers["Last-Modified"] = new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["Cache-Control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["Last-Modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(req, header, includes) {
  const value = req.headers[header];
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event.req, "accept", "application/json") || hasReqHeader(event.req, "user-agent", "curl/") || hasReqHeader(event.req, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Route Not Found" : "Internal Server Error");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error);
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    stack: "",
    data: error.data
  };
  event.res.statusCode = errorObject.statusCode;
  event.res.statusMessage = errorObject.statusMessage;
  if (error.unhandled || error.fatal) {
    const tags = [
      "[nuxt]",
      "[request error]",
      error.unhandled && "[unhandled]",
      error.fatal && "[fatal]",
      Number(errorObject.statusCode) !== 200 && `[${errorObject.statusCode}]`
    ].filter(Boolean).join(" ");
    console.error(tags, errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.res.setHeader("Content-Type", "application/json");
    event.res.end(JSON.stringify(errorObject));
    return;
  }
  const isErrorPage = event.req.url?.startsWith("/__nuxt_error");
  let html = !isErrorPage ? await $fetch(withQuery("/__nuxt_error", errorObject)).catch(() => null) : null;
  if (!html) {
    const { template } = await import('../error-500.mjs');
    html = template(errorObject);
  }
  event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  event.res.end(html);
});

const assets = {
  "/favicon.ico": {
    "type": "image/vnd.microsoft.icon",
    "etag": "\"10be-wGBe/tk27iYAKE5kgFIdBvpk+HI\"",
    "mtime": "2022-10-13T02:39:09.892Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/logo.svg": {
    "type": "image/svg+xml",
    "etag": "\"134-bsIgfzTLCe6ocIv1rihYHmaM7Ls\"",
    "mtime": "2022-10-13T02:39:09.884Z",
    "size": 308,
    "path": "../public/logo.svg"
  },
  "/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"3b8-Ma/51mzfDrSdSabuT2UP3v/h+kc\"",
    "mtime": "2022-10-13T02:39:09.821Z",
    "size": 952,
    "path": "../public/manifest.json.br"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": "\"28b-nivQobeuhNT5fH3p1bpz8snx7Hs\"",
    "mtime": "2022-10-13T02:39:09.883Z",
    "size": 651,
    "path": "../public/manifest.webmanifest"
  },
  "/public-path.js": {
    "type": "application/javascript",
    "etag": "\"6e-5IFA6Z14JQLOy/P+MmN88/jDfN0\"",
    "mtime": "2022-10-13T02:39:09.882Z",
    "size": 110,
    "path": "../public/public-path.js"
  },
  "/qiankun-entry.js": {
    "type": "application/javascript",
    "etag": "\"25c-GB1+6OpRFjJNawsRxBLsyUQLrjs\"",
    "mtime": "2022-10-13T02:39:09.881Z",
    "size": 604,
    "path": "../public/qiankun-entry.js"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"58-dFNmoc0+6sM3GBLd+mn2nBnEUZU\"",
    "mtime": "2022-10-13T02:39:09.880Z",
    "size": 88,
    "path": "../public/robots.txt"
  },
  "/s.min.js": {
    "type": "application/javascript",
    "etag": "\"1e3e-IURe+8f29UiKSVLoy7+WNh665cA\"",
    "mtime": "2022-10-13T02:39:09.878Z",
    "size": 7742,
    "path": "../public/s.min.js"
  },
  "/s.min.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"aca-IfkzWSr51lZWQeCctWNtYFM+MHs\"",
    "mtime": "2022-10-13T02:39:09.816Z",
    "size": 2762,
    "path": "../public/s.min.js.br"
  },
  "/stats.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"b7407-lRExnscfVLvm50WYxfKmmW5Hprg\"",
    "mtime": "2022-10-13T02:39:09.815Z",
    "size": 750599,
    "path": "../public/stats.html"
  },
  "/stats.html.br": {
    "type": "text/html; charset=utf-8",
    "encoding": "br",
    "etag": "\"11bcb-eEDI6M8cXFCyVMg+Uq7Aadv6YzE\"",
    "mtime": "2022-10-13T02:39:09.812Z",
    "size": 72651,
    "path": "../public/stats.html.br"
  },
  "/sw-dev.js": {
    "type": "application/javascript",
    "etag": "\"55c-9JS7V6y6QuCwaMIPQjEywzwNR5Q\"",
    "mtime": "2022-10-13T02:39:09.878Z",
    "size": 1372,
    "path": "../public/sw-dev.js"
  },
  "/sw-dev.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"1c4-e8lprL7jSENc2XJ8fQ+q8FaIbk0\"",
    "mtime": "2022-10-13T02:39:09.811Z",
    "size": 452,
    "path": "../public/sw-dev.js.br"
  },
  "/sw-prod.js": {
    "type": "application/javascript",
    "etag": "\"47f-xGIuN7k851Og36sqte8i0NWegdw\"",
    "mtime": "2022-10-13T02:39:09.877Z",
    "size": 1151,
    "path": "../public/sw-prod.js"
  },
  "/sw-prod.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"166-cvoTWlUxvtn2pmLQvHdhbaiD1cY\"",
    "mtime": "2022-10-13T02:39:09.809Z",
    "size": 358,
    "path": "../public/sw-prod.js.br"
  },
  "/_nuxt/OrderPopover.8a414369.js": {
    "type": "application/javascript",
    "etag": "\"41f-Pba5MbQYr0XowxBNsOLFOv7eqgA\"",
    "mtime": "2022-10-13T02:39:09.874Z",
    "size": 1055,
    "path": "../public/_nuxt/OrderPopover.8a414369.js"
  },
  "/_nuxt/OrderPopover.8a414369.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"261-/cV2VB22E54FeUEMLahzJJNcaqo\"",
    "mtime": "2022-10-13T02:39:09.873Z",
    "size": 609,
    "path": "../public/_nuxt/OrderPopover.8a414369.js.br"
  },
  "/_nuxt/OrderPopover.dd3e9913.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a70-ry66MS+dvDTmyBn3c4+PGpehaMw\"",
    "mtime": "2022-10-13T02:39:09.872Z",
    "size": 2672,
    "path": "../public/_nuxt/OrderPopover.dd3e9913.css"
  },
  "/_nuxt/OrderPopover.dd3e9913.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"280-z6OnpFlN1aeRJzHY8xHhpp2JBiU\"",
    "mtime": "2022-10-13T02:39:09.871Z",
    "size": 640,
    "path": "../public/_nuxt/OrderPopover.dd3e9913.css.br"
  },
  "/_nuxt/_id_.903802cd.js": {
    "type": "application/javascript",
    "etag": "\"185f-Qh+LNLViPzQjzY7+SuYh7h5Ncxo\"",
    "mtime": "2022-10-13T02:39:09.870Z",
    "size": 6239,
    "path": "../public/_nuxt/_id_.903802cd.js"
  },
  "/_nuxt/_id_.903802cd.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"a84-aU/zzkxel16a+fk7HfxzXsgJKL0\"",
    "mtime": "2022-10-13T02:39:09.870Z",
    "size": 2692,
    "path": "../public/_nuxt/_id_.903802cd.js.br"
  },
  "/_nuxt/_id_.9d540f04.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"117c-6oxRjZu6IjIsA+RMCUR+j/GmH7Y\"",
    "mtime": "2022-10-13T02:39:09.870Z",
    "size": 4476,
    "path": "../public/_nuxt/_id_.9d540f04.css"
  },
  "/_nuxt/_id_.9d540f04.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"407-mV146SSwWEtike/czxDFHHUWDP8\"",
    "mtime": "2022-10-13T02:39:09.869Z",
    "size": 1031,
    "path": "../public/_nuxt/_id_.9d540f04.css.br"
  },
  "/_nuxt/_plugin-vue_export-helper.a1a6add7.js": {
    "type": "application/javascript",
    "etag": "\"5b-SqaToq/MNLald+G/xL4+9aRY3OA\"",
    "mtime": "2022-10-13T02:39:09.868Z",
    "size": 91,
    "path": "../public/_nuxt/_plugin-vue_export-helper.a1a6add7.js"
  },
  "/_nuxt/auth.9307e1fd.js": {
    "type": "application/javascript",
    "etag": "\"99-BysG1K3DPTtA82bk7FVpz3ckKWs\"",
    "mtime": "2022-10-13T02:39:09.868Z",
    "size": 153,
    "path": "../public/_nuxt/auth.9307e1fd.js"
  },
  "/_nuxt/banner.d75e2f5e.jpg": {
    "type": "image/jpeg",
    "etag": "\"cd58-7qjae7h8JmXqZAQWBFK0/ESM2t8\"",
    "mtime": "2022-10-13T02:39:09.867Z",
    "size": 52568,
    "path": "../public/_nuxt/banner.d75e2f5e.jpg"
  },
  "/_nuxt/bg.ec928e8e.png": {
    "type": "image/png",
    "etag": "\"ce80-aHiilpNymn84BFNT4vNZfcv3xnE\"",
    "mtime": "2022-10-13T02:39:09.866Z",
    "size": 52864,
    "path": "../public/_nuxt/bg.ec928e8e.png"
  },
  "/_nuxt/en.df668989.js": {
    "type": "application/javascript",
    "etag": "\"5d0-J8gQkx+XLG7ouy4XaAFSGxMOW3I\"",
    "mtime": "2022-10-13T02:39:09.866Z",
    "size": 1488,
    "path": "../public/_nuxt/en.df668989.js"
  },
  "/_nuxt/en.df668989.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"298-xMNmBwzJkXOKG2rvfBmyYd3hum4\"",
    "mtime": "2022-10-13T02:39:09.865Z",
    "size": 664,
    "path": "../public/_nuxt/en.df668989.js.br"
  },
  "/_nuxt/entry.7de3f89d.js": {
    "type": "application/javascript",
    "etag": "\"785af-/3tURzDbrxNEWskEddwQDanP1WE\"",
    "mtime": "2022-10-13T02:39:09.862Z",
    "size": 492975,
    "path": "../public/_nuxt/entry.7de3f89d.js"
  },
  "/_nuxt/entry.7de3f89d.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"22143-W2VQVhRjKoKG68NBShu7/ih3z5A\"",
    "mtime": "2022-10-13T02:39:09.860Z",
    "size": 139587,
    "path": "../public/_nuxt/entry.7de3f89d.js.br"
  },
  "/_nuxt/entry.f91083af.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1e409-XZ9WHfkQQp/awQSwZkO58okhNQo\"",
    "mtime": "2022-10-13T02:39:09.860Z",
    "size": 123913,
    "path": "../public/_nuxt/entry.f91083af.css"
  },
  "/_nuxt/entry.f91083af.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"39ed-klQACIQra75xJwKmbbCRYaEjfq8\"",
    "mtime": "2022-10-13T02:39:09.859Z",
    "size": 14829,
    "path": "../public/_nuxt/entry.f91083af.css.br"
  },
  "/_nuxt/error-404.92e2ae27.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"11db-9L5wSbUJsrhewS7SeeHZa22aKQk\"",
    "mtime": "2022-10-13T02:39:09.858Z",
    "size": 4571,
    "path": "../public/_nuxt/error-404.92e2ae27.css"
  },
  "/_nuxt/error-404.92e2ae27.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"44f-kzOXBgpaZhWu96esWmrfBEk8Bjw\"",
    "mtime": "2022-10-13T02:39:09.858Z",
    "size": 1103,
    "path": "../public/_nuxt/error-404.92e2ae27.css.br"
  },
  "/_nuxt/error-404.9a0116f5.js": {
    "type": "application/javascript",
    "etag": "\"8e0-QBd606kfpndDLgWR2OYbaTL1UKA\"",
    "mtime": "2022-10-13T02:39:09.857Z",
    "size": 2272,
    "path": "../public/_nuxt/error-404.9a0116f5.js"
  },
  "/_nuxt/error-404.9a0116f5.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"3ef-9ptzLPf8mHUnuDYZSL6fs4zTn2A\"",
    "mtime": "2022-10-13T02:39:09.857Z",
    "size": 1007,
    "path": "../public/_nuxt/error-404.9a0116f5.js.br"
  },
  "/_nuxt/error-500.a37341a2.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7c9-LmK19WNMTpu90sLhyYp/k4Ra96g\"",
    "mtime": "2022-10-13T02:39:09.856Z",
    "size": 1993,
    "path": "../public/_nuxt/error-500.a37341a2.css"
  },
  "/_nuxt/error-500.a37341a2.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"281-x6WxtYWypuQy2oCbEHpmrU3fURU\"",
    "mtime": "2022-10-13T02:39:09.856Z",
    "size": 641,
    "path": "../public/_nuxt/error-500.a37341a2.css.br"
  },
  "/_nuxt/error-500.a3e51e6a.js": {
    "type": "application/javascript",
    "etag": "\"787-CtnLb566uEmIvJGngOBHOAlMb6A\"",
    "mtime": "2022-10-13T02:39:09.854Z",
    "size": 1927,
    "path": "../public/_nuxt/error-500.a3e51e6a.js"
  },
  "/_nuxt/error-500.a3e51e6a.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"36a-cpVZ30066T12Pf9JCVRdPmxhUls\"",
    "mtime": "2022-10-13T02:39:09.853Z",
    "size": 874,
    "path": "../public/_nuxt/error-500.a3e51e6a.js.br"
  },
  "/_nuxt/error-component.1c6b828b.js": {
    "type": "application/javascript",
    "etag": "\"4c2-r1TtZ1hHe7NHV2QDneEXQl3yR40\"",
    "mtime": "2022-10-13T02:39:09.853Z",
    "size": 1218,
    "path": "../public/_nuxt/error-component.1c6b828b.js"
  },
  "/_nuxt/error-component.1c6b828b.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"22d-9tUnfP30ws2fTjCW+R3Dpj9R1D0\"",
    "mtime": "2022-10-13T02:39:09.852Z",
    "size": 557,
    "path": "../public/_nuxt/error-component.1c6b828b.js.br"
  },
  "/_nuxt/index.89327619.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cb9-vSNSRTHWFHnLPkvX5TArp4jl76k\"",
    "mtime": "2022-10-13T02:39:09.852Z",
    "size": 3257,
    "path": "../public/_nuxt/index.89327619.css"
  },
  "/_nuxt/index.89327619.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"33a-S/3JQ2511H9mBzHaETvJeEJcDV4\"",
    "mtime": "2022-10-13T02:39:09.849Z",
    "size": 826,
    "path": "../public/_nuxt/index.89327619.css.br"
  },
  "/_nuxt/index.d11a1ce0.js": {
    "type": "application/javascript",
    "etag": "\"e33-hbWGNEHXDgqbGiHwiLOUNIM/ZU0\"",
    "mtime": "2022-10-13T02:39:09.846Z",
    "size": 3635,
    "path": "../public/_nuxt/index.d11a1ce0.js"
  },
  "/_nuxt/index.d11a1ce0.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"5cc-USVQPZ4CxaWpJ/JE1NmtkTAHKaU\"",
    "mtime": "2022-10-13T02:39:09.845Z",
    "size": 1484,
    "path": "../public/_nuxt/index.d11a1ce0.js.br"
  },
  "/_nuxt/login.01d9ad1b.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c7a-XNepyxOTTw+KHw+03G1DHR2sRsA\"",
    "mtime": "2022-10-13T02:39:09.844Z",
    "size": 3194,
    "path": "../public/_nuxt/login.01d9ad1b.css"
  },
  "/_nuxt/login.01d9ad1b.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"29e-RKk6dJOZTh6JJpGWvpsCBaAZrEM\"",
    "mtime": "2022-10-13T02:39:09.842Z",
    "size": 670,
    "path": "../public/_nuxt/login.01d9ad1b.css.br"
  },
  "/_nuxt/login.b7536aa9.js": {
    "type": "application/javascript",
    "etag": "\"9e9-Vyecvb1cHK2ZnXIYJFPL9HrRkPY\"",
    "mtime": "2022-10-13T02:39:09.841Z",
    "size": 2537,
    "path": "../public/_nuxt/login.b7536aa9.js"
  },
  "/_nuxt/login.b7536aa9.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"3e2-1YdZdLFoeAuA9x5yzKoyAFphXBo\"",
    "mtime": "2022-10-13T02:39:09.840Z",
    "size": 994,
    "path": "../public/_nuxt/login.b7536aa9.js.br"
  },
  "/_nuxt/logo.a0bc2137.png": {
    "type": "image/png",
    "etag": "\"1056-2kUmWzZ74wqhfz9e5gswxDWN9/c\"",
    "mtime": "2022-10-13T02:39:09.839Z",
    "size": 4182,
    "path": "../public/_nuxt/logo.a0bc2137.png"
  },
  "/_nuxt/record.21a0b7bb.js": {
    "type": "application/javascript",
    "etag": "\"54b-9I6JvsNgWAhLL3Ob1K7f3qrlk7A\"",
    "mtime": "2022-10-13T02:39:09.835Z",
    "size": 1355,
    "path": "../public/_nuxt/record.21a0b7bb.js"
  },
  "/_nuxt/record.21a0b7bb.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"2a6-OX6QhPrfLk1joy/smyVXM7cm3pk\"",
    "mtime": "2022-10-13T02:39:09.835Z",
    "size": 678,
    "path": "../public/_nuxt/record.21a0b7bb.js.br"
  },
  "/_nuxt/record.f669cfa4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ff-y0hw9m29JNpTSvxFJUhXsI6jBv8\"",
    "mtime": "2022-10-13T02:39:09.833Z",
    "size": 1535,
    "path": "../public/_nuxt/record.f669cfa4.css"
  },
  "/_nuxt/record.f669cfa4.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1bf-J6E7q35vxp8Wlv/ksyobT3q0cHk\"",
    "mtime": "2022-10-13T02:39:09.833Z",
    "size": 447,
    "path": "../public/_nuxt/record.f669cfa4.css.br"
  },
  "/_nuxt/useFetchRoom.5b3332d8.js": {
    "type": "application/javascript",
    "etag": "\"d9b-lxkXOwwoRiHec3SaXJf6zPseU5A\"",
    "mtime": "2022-10-13T02:39:09.832Z",
    "size": 3483,
    "path": "../public/_nuxt/useFetchRoom.5b3332d8.js"
  },
  "/_nuxt/useFetchRoom.5b3332d8.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"557-nktPzoMMXbh2I83JGfE66vGSrHg\"",
    "mtime": "2022-10-13T02:39:09.830Z",
    "size": 1367,
    "path": "../public/_nuxt/useFetchRoom.5b3332d8.js.br"
  },
  "/_nuxt/zh-cn.0e851c06.js": {
    "type": "application/javascript",
    "etag": "\"796-dLked4c9p1J7sJlJD4iDkd8Vj6U\"",
    "mtime": "2022-10-13T02:39:09.829Z",
    "size": 1942,
    "path": "../public/_nuxt/zh-cn.0e851c06.js"
  },
  "/_nuxt/zh-cn.0e851c06.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"313-xZ+ufccnbF0V6cHIpG3soVKtzcM\"",
    "mtime": "2022-10-13T02:39:09.828Z",
    "size": 787,
    "path": "../public/_nuxt/zh-cn.0e851c06.js.br"
  },
  "/_nuxt/zh.77210e57.js": {
    "type": "application/javascript",
    "etag": "\"5af-3XpOsJ3acLi9u30N5KEU9Wee/VI\"",
    "mtime": "2022-10-13T02:39:09.828Z",
    "size": 1455,
    "path": "../public/_nuxt/zh.77210e57.js"
  },
  "/_nuxt/zh.77210e57.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"2e8-FV9K06TqM3De1SSONOKoaJZTU+I\"",
    "mtime": "2022-10-13T02:39:09.827Z",
    "size": 744,
    "path": "../public/_nuxt/zh.77210e57.js.br"
  },
  "/icons/icon-192x192.png": {
    "type": "image/png",
    "etag": "\"29c4-NriTNBvcWHJR3YBDt//tAO+yuMA\"",
    "mtime": "2022-10-13T02:39:09.891Z",
    "size": 10692,
    "path": "../public/icons/icon-192x192.png"
  },
  "/icons/icon-512x512.png": {
    "type": "image/png",
    "etag": "\"9168-9ij8zOTFXbV2adspote6EXEhxnA\"",
    "mtime": "2022-10-13T02:39:09.890Z",
    "size": 37224,
    "path": "../public/icons/icon-512x512.png"
  },
  "/icons/icon_light.svg": {
    "type": "image/svg+xml",
    "etag": "\"a5f-LpV+6vuG7YNr+ezVO8vkv0Df+nY\"",
    "mtime": "2022-10-13T02:39:09.887Z",
    "size": 2655,
    "path": "../public/icons/icon_light.svg"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = [];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const EncodingMap = { gzip: ".gz", br: ".br" };
const _f4b49z = eventHandler(async (event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return;
  }
  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)));
  let asset;
  const encodingHeader = String(event.req.headers["accept-encoding"] || "");
  const encodings = encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort().concat([""]);
  if (encodings.length > 1) {
    event.res.setHeader("Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.res.statusCode = 304;
    event.res.end("Not Modified (etag)");
    return;
  }
  const ifModifiedSinceH = event.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304;
      event.res.end("Not Modified (mtime)");
      return;
    }
  }
  if (asset.type) {
    event.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    event.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    event.res.setHeader("Last-Modified", asset.mtime);
  }
  if (asset.encoding) {
    event.res.setHeader("Content-Encoding", asset.encoding);
  }
  if (asset.size) {
    event.res.setHeader("Content-Length", asset.size);
  }
  const contents = await readAsset(id);
  event.res.end(contents);
});

const manifest = {
	"assets/images/home/banner.jpg": {
	resourceType: "image",
	mimeType: "image/jpeg",
	file: "banner.d75e2f5e.jpg",
	src: "assets/images/home/banner.jpg"
},
	"assets/images/login/bg.png": {
	resourceType: "image",
	mimeType: "image/png",
	file: "bg.ec928e8e.png",
	src: "assets/images/login/bg.png"
},
	"assets/images/layout/logo.png": {
	resourceType: "image",
	mimeType: "image/png",
	file: "logo.a0bc2137.png",
	src: "assets/images/layout/logo.png"
},
	"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs": {
	resourceType: "script",
	module: true,
	file: "entry.7de3f89d.js",
	src: "node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
	isEntry: true,
	dynamicImports: [
		"pages/detail/[id].vue",
		"pages/index.vue",
		"pages/login.vue",
		"pages/record.vue",
		"middleware/auth.ts",
		"node_modules/.pnpm/element-plus@2.2.17_vue@3.2.40/node_modules/element-plus/es/locale/lang/zh-cn.mjs",
		"common/i18n/en.ts",
		"common/i18n/zh.ts",
		"virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/ssr/nuxt-ssr/.nuxt/error-component.mjs",
		"components/order/OrderPopover.vue"
	],
	css: [
		"entry.f91083af.css"
	],
	assets: [
		"logo.a0bc2137.png"
	]
},
	"entry.f91083af.css": {
	file: "entry.f91083af.css",
	resourceType: "style"
},
	"logo.a0bc2137.png": {
	file: "logo.a0bc2137.png",
	resourceType: "image",
	mimeType: "image/png"
},
	"virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/ssr/nuxt-ssr/.nuxt/error-component.mjs": {
	resourceType: "script",
	module: true,
	file: "error-component.1c6b828b.js",
	src: "virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/ssr/nuxt-ssr/.nuxt/error-component.mjs",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs"
	],
	dynamicImports: [
		"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue",
		"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue"
	]
},
	"pages/detail/[id].vue": {
	resourceType: "script",
	module: true,
	file: "_id_.903802cd.js",
	src: "pages/detail/[id].vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
		"_useFetchRoom.5b3332d8.js"
	],
	css: [
		"_id_.9d540f04.css"
	]
},
	"_id_.9d540f04.css": {
	file: "_id_.9d540f04.css",
	resourceType: "style"
},
	"_useFetchRoom.5b3332d8.js": {
	resourceType: "script",
	module: true,
	file: "useFetchRoom.5b3332d8.js",
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs"
	]
},
	"pages/index.vue": {
	resourceType: "script",
	module: true,
	file: "index.d11a1ce0.js",
	src: "pages/index.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
		"_useFetchRoom.5b3332d8.js"
	],
	css: [
		"index.89327619.css"
	],
	assets: [
		"banner.d75e2f5e.jpg"
	]
},
	"index.89327619.css": {
	file: "index.89327619.css",
	resourceType: "style"
},
	"banner.d75e2f5e.jpg": {
	file: "banner.d75e2f5e.jpg",
	resourceType: "image",
	mimeType: "image/jpeg"
},
	"pages/login.vue": {
	resourceType: "script",
	module: true,
	file: "login.b7536aa9.js",
	src: "pages/login.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs"
	],
	css: [
		"login.01d9ad1b.css"
	],
	assets: [
		"bg.ec928e8e.png"
	]
},
	"login.01d9ad1b.css": {
	file: "login.01d9ad1b.css",
	resourceType: "style"
},
	"bg.ec928e8e.png": {
	file: "bg.ec928e8e.png",
	resourceType: "image",
	mimeType: "image/png"
},
	"pages/record.vue": {
	resourceType: "script",
	module: true,
	file: "record.21a0b7bb.js",
	src: "pages/record.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs"
	],
	css: [
		"record.f669cfa4.css"
	]
},
	"record.f669cfa4.css": {
	file: "record.f669cfa4.css",
	resourceType: "style"
},
	"middleware/auth.ts": {
	resourceType: "script",
	module: true,
	file: "auth.9307e1fd.js",
	src: "middleware/auth.ts",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs"
	]
},
	"components/order/OrderPopover.vue": {
	resourceType: "script",
	module: true,
	file: "OrderPopover.8a414369.js",
	src: "components/order/OrderPopover.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
		"__plugin-vue_export-helper.a1a6add7.js"
	],
	css: [
		"OrderPopover.dd3e9913.css"
	]
},
	"OrderPopover.dd3e9913.css": {
	file: "OrderPopover.dd3e9913.css",
	resourceType: "style"
},
	"__plugin-vue_export-helper.a1a6add7.js": {
	resourceType: "script",
	module: true,
	file: "_plugin-vue_export-helper.a1a6add7.js"
},
	"node_modules/.pnpm/element-plus@2.2.17_vue@3.2.40/node_modules/element-plus/es/locale/lang/zh-cn.mjs": {
	resourceType: "script",
	module: true,
	file: "zh-cn.0e851c06.js",
	src: "node_modules/.pnpm/element-plus@2.2.17_vue@3.2.40/node_modules/element-plus/es/locale/lang/zh-cn.mjs",
	isDynamicEntry: true
},
	"common/i18n/en.ts": {
	resourceType: "script",
	module: true,
	file: "en.df668989.js",
	src: "common/i18n/en.ts",
	isDynamicEntry: true
},
	"common/i18n/zh.ts": {
	resourceType: "script",
	module: true,
	file: "zh.77210e57.js",
	src: "common/i18n/zh.ts",
	isDynamicEntry: true
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue": {
	resourceType: "script",
	module: true,
	file: "error-404.9a0116f5.js",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
		"__plugin-vue_export-helper.a1a6add7.js"
	],
	css: [
		"error-404.92e2ae27.css"
	]
},
	"error-404.92e2ae27.css": {
	file: "error-404.92e2ae27.css",
	resourceType: "style"
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue": {
	resourceType: "script",
	module: true,
	file: "error-500.a3e51e6a.js",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.mjs",
		"__plugin-vue_export-helper.a1a6add7.js"
	],
	css: [
		"error-500.a37341a2.css"
	]
},
	"error-500.a37341a2.css": {
	file: "error-500.a37341a2.css",
	resourceType: "style"
},
	"pages/record.css": {
	resourceType: "style",
	file: "record.f669cfa4.css",
	src: "pages/record.css"
},
	"pages/index.css": {
	resourceType: "style",
	file: "index.89327619.css",
	src: "pages/index.css"
},
	"components/order/OrderPopover.css": {
	resourceType: "style",
	file: "OrderPopover.dd3e9913.css",
	src: "components/order/OrderPopover.css"
},
	"pages/login.css": {
	resourceType: "style",
	file: "login.01d9ad1b.css",
	src: "pages/login.css"
},
	"pages/detail/[id].css": {
	resourceType: "style",
	file: "_id_.9d540f04.css",
	src: "pages/detail/[id].css"
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.css": {
	resourceType: "style",
	file: "error-500.a37341a2.css",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.css"
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.css": {
	resourceType: "style",
	file: "error-404.92e2ae27.css",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.css"
},
	"node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.css": {
	resourceType: "style",
	file: "entry.f91083af.css",
	src: "node_modules/.pnpm/nuxt@3.0.0-rc.11_22r47xtm643gftgu7j32e5ljjm/node_modules/nuxt/dist/app/entry.css"
}
};

const isProd = true;
const CDN_URL = "https://static.yiminfe.com/nuxt-ssr" ;
const pages = [
  "pages/index.vue",
  "pages/login.vue",
  "pages/record.vue",
  "pages/detail/[id].vue"
];
function renderPagePrefetchLink(file) {
  const prefix = "_nuxt";
  if (file.endsWith(".js")) {
    return `<link rel="prefetch" as="script" href="${CDN_URL}/${prefix}/${file}">`;
  } else if (file.endsWith(".css")) {
    return `<link rel="prefetch" as="style" href="${CDN_URL}/${prefix}/${file}">`;
  }
}
function renderLinks(modules) {
  let links = "";
  modules.forEach((id) => {
    const file = manifest[id];
    if (file) {
      links += renderPagePrefetchLink(file.file);
      const { css } = file;
      for (const item of css) {
        links += renderPagePrefetchLink(item);
      }
    }
  });
  return links;
}
function renderWorkboxUpdate() {
  return `<script>navigator&&navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',function(event){if(event.data.meta==='workbox-broadcast-update'){window.location.reload()}})<\/script>`;
}
const _zbhZbR = defineEventHandler((event) => {
  console.log("\u8FDB\u5165\u4E86interceptor\u4E2D\u95F4\u4EF6");
  const { res } = event;
  const originalEnd = res.end;
  res.end = (html) => {
    let newHtml = html;
    if (isProd) {
      const prefetchLinks = renderLinks(pages);
      const workboxUpdate = renderWorkboxUpdate();
      newHtml = newHtml.replace(
        "</head>",
        `${prefetchLinks}${workboxUpdate}</head>`
      );
    }
    res.setHeader("ETag", createEtag(newHtml));
    return originalEnd(newHtml);
  };
});

const _WG7vci = defineEventHandler((event) => {
  const { res } = event;
  res.setHeader("Access-Control-Allow-Origin", "*");
});

const _lazy_WuMf61 = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _zbhZbR, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _WG7vci, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_WuMf61, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_WuMf61, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
  const routerOptions = createRouter$1({ routes: config.nitro.routes });
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    const referenceRoute = h.route.replace(/:\w+|\*\*/g, "_");
    const routeOptions = routerOptions.lookup(referenceRoute) || {};
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: "nitro/routes"
      });
    }
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(/\/+/g, "/");
      h3App.use(middlewareBase, handler);
    } else {
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(h3App.nodeHandler);
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();
const useNitroApp = () => nitroApp;

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, nitroApp.h3App.nodeHandler) : new Server$1(nitroApp.h3App.nodeHandler);
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const host = process.env.NITRO_HOST || process.env.HOST;
const s = server.listen(port, host, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  const i = s.address();
  const baseURL = (useRuntimeConfig().app.baseURL || "").replace(/\/$/, "");
  const url = `${protocol}://${i.family === "IPv6" ? `[${i.address}]` : i.address}:${i.port}${baseURL}`;
  console.log(`Listening ${url}`);
});
{
  process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
  process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));
}
const nodeServer = {};

export { useRuntimeConfig as a, nodeServer as n, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
