globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { withoutTrailingSlash, getQuery as getQuery$1, parseURL, withQuery, withLeadingSlash, joinURL } from 'ufo';
import { createRouter as createRouter$1 } from 'radix3';
import { createFetch as createFetch$1, Headers } from 'ohmyfetch';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { createStorage } from 'unstorage';
import { promises } from 'fs';
import { dirname, resolve } from 'pathe';
import { fileURLToPath } from 'url';
import createEtag from 'etag';

class H3Error extends Error {
  constructor() {
    super(...arguments);
    this.statusCode = 500;
    this.fatal = false;
    this.unhandled = false;
    this.statusMessage = "Internal Server Error";
  }
}
H3Error.__h3_error__ = true;
function createError(input) {
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error(input.message ?? input.statusMessage, input.cause ? { cause: input.cause } : void 0);
  if ("stack" in input) {
    try {
      Object.defineProperty(err, "stack", { get() {
        return input.stack;
      } });
    } catch {
      try {
        err.stack = input.stack;
      } catch {
      }
    }
  }
  if (input.statusCode) {
    err.statusCode = input.statusCode;
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function sendError(event, error, debug) {
  if (event.res.writableEnded) {
    return;
  }
  const h3Error = isError(error) ? error : createError(error);
  const responseBody = {
    statusCode: h3Error.statusCode,
    statusMessage: h3Error.statusMessage,
    stack: [],
    data: h3Error.data
  };
  if (debug) {
    responseBody.stack = (h3Error.stack || "").split("\n").map((l) => l.trim());
  }
  if (event.res.writableEnded) {
    return;
  }
  event.res.statusCode = h3Error.statusCode;
  event.res.statusMessage = h3Error.statusMessage;
  event.res.setHeader("Content-Type", MIMES.json);
  event.res.end(JSON.stringify(responseBody, null, 2));
}
function isError(input) {
  return input?.constructor?.__h3_error__ === true;
}

function getQuery(event) {
  return getQuery$1(event.req.url || "");
}

function handleCacheHeaders(event, opts) {
  const cacheControls = ["public"].concat(opts.cacheControls || []);
  let cacheMatched = false;
  if (opts.maxAge !== void 0) {
    cacheControls.push(`max-age=${+opts.maxAge}`, `s-maxage=${+opts.maxAge}`);
  }
  if (opts.modifiedTime) {
    const modifiedTime = new Date(opts.modifiedTime);
    const ifModifiedSince = event.req.headers["if-modified-since"];
    event.res.setHeader("Last-Modified", modifiedTime.toUTCString());
    if (ifModifiedSince) {
      if (new Date(ifModifiedSince) >= opts.modifiedTime) {
        cacheMatched = true;
      }
    }
  }
  if (opts.etag) {
    event.res.setHeader("Etag", opts.etag);
    const ifNonMatch = event.req.headers["if-none-match"];
    if (ifNonMatch === opts.etag) {
      cacheMatched = true;
    }
  }
  event.res.setHeader("Cache-Control", cacheControls.join(", "));
  if (cacheMatched) {
    event.res.statusCode = 304;
    event.res.end("");
    return true;
  }
  return false;
}

const MIMES = {
  html: "text/html",
  json: "application/json"
};

const defer = typeof setImmediate !== "undefined" ? setImmediate : (fn) => fn();
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      event.res.end(data);
      resolve(void 0);
    });
  });
}
function defaultContentType(event, type) {
  if (type && !event.res.getHeader("Content-Type")) {
    event.res.setHeader("Content-Type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.res.statusCode = code;
  event.res.setHeader("Location", location);
  const encodedLoc = location.replace(/"/g, "%22");
  const html = `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`;
  return send(event, html, MIMES.html);
}
function appendResponseHeader(event, name, value) {
  let current = event.res.getHeader(name);
  if (!current) {
    event.res.setHeader(name, value);
    return;
  }
  if (!Array.isArray(current)) {
    current = [current.toString()];
  }
  event.res.setHeader(name, current.concat(value));
}
const appendHeader = appendResponseHeader;
function isStream(data) {
  return data && typeof data === "object" && typeof data.pipe === "function" && typeof data.on === "function";
}
function sendStream(event, data) {
  return new Promise((resolve, reject) => {
    data.pipe(event.res);
    data.on("end", () => resolve(void 0));
    data.on("error", (error) => reject(createError(error)));
  });
}

class H3Headers {
  constructor(init) {
    if (!init) {
      this._headers = {};
    } else if (Array.isArray(init)) {
      this._headers = Object.fromEntries(init.map(([key, value]) => [key.toLowerCase(), value]));
    } else if (init && "append" in init) {
      this._headers = Object.fromEntries([...init.entries()]);
    } else {
      this._headers = Object.fromEntries(Object.entries(init).map(([key, value]) => [key.toLowerCase(), value]));
    }
  }
  append(name, value) {
    const _name = name.toLowerCase();
    this.set(_name, [this.get(_name), value].filter(Boolean).join(", "));
  }
  delete(name) {
    delete this._headers[name.toLowerCase()];
  }
  get(name) {
    return this._headers[name.toLowerCase()];
  }
  has(name) {
    return name.toLowerCase() in this._headers;
  }
  set(name, value) {
    this._headers[name.toLowerCase()] = String(value);
  }
  forEach(callbackfn) {
    Object.entries(this._headers).forEach(([key, value]) => callbackfn(value, key, this));
  }
}

class H3Response {
  constructor(body = null, init = {}) {
    this.body = null;
    this.type = "default";
    this.bodyUsed = false;
    this.headers = new H3Headers(init.headers);
    this.status = init.status ?? 200;
    this.statusText = init.statusText || "";
    this.redirected = !!init.status && [301, 302, 307, 308].includes(init.status);
    this._body = body;
    this.url = "";
    this.ok = this.status < 300 && this.status > 199;
  }
  clone() {
    return new H3Response(this.body, {
      headers: this.headers,
      status: this.status,
      statusText: this.statusText
    });
  }
  arrayBuffer() {
    return Promise.resolve(this._body);
  }
  blob() {
    return Promise.resolve(this._body);
  }
  formData() {
    return Promise.resolve(this._body);
  }
  json() {
    return Promise.resolve(this._body);
  }
  text() {
    return Promise.resolve(this._body);
  }
}

class H3Event {
  constructor(req, res) {
    this["__is_event__"] = true;
    this.context = {};
    this.req = req;
    this.res = res;
    this.event = this;
    req.event = this;
    req.context = this.context;
    req.req = req;
    req.res = res;
    res.event = this;
    res.res = res;
    res.req = res.req || {};
    res.req.res = res;
    res.req.req = req;
  }
  respondWith(r) {
    Promise.resolve(r).then((_response) => {
      if (this.res.writableEnded) {
        return;
      }
      const response = _response instanceof H3Response ? _response : new H3Response(_response);
      response.headers.forEach((value, key) => {
        this.res.setHeader(key, value);
      });
      if (response.status) {
        this.res.statusCode = response.status;
      }
      if (response.statusText) {
        this.res.statusMessage = response.statusText;
      }
      if (response.redirected) {
        this.res.setHeader("Location", response.url);
      }
      if (!response._body) {
        return this.res.end();
      }
      if (typeof response._body === "string" || "buffer" in response._body || "byteLength" in response._body) {
        return this.res.end(response._body);
      }
      if (!response.headers.has("content-type")) {
        response.headers.set("content-type", MIMES.json);
      }
      this.res.end(JSON.stringify(response._body));
    });
  }
}
function createEvent(req, res) {
  return new H3Event(req, res);
}
function callHandler(handler, req, res) {
  const isMiddleware = handler.length > 2;
  return new Promise((resolve, reject) => {
    const next = (err) => {
      if (isMiddleware) {
        res.off("close", next);
        res.off("error", next);
      }
      return err ? reject(createError(err)) : resolve(void 0);
    };
    try {
      const returned = handler(req, res, next);
      if (isMiddleware && returned === void 0) {
        res.once("close", next);
        res.once("error", next);
      } else {
        resolve(returned);
      }
    } catch (err) {
      next(err);
    }
  });
}

function defineEventHandler(handler) {
  handler.__is_handler__ = true;
  return handler;
}
const eventHandler = defineEventHandler;
function isEventHandler(input) {
  return "__is_handler__" in input;
}
function toEventHandler(handler) {
  if (isEventHandler(handler)) {
    return handler;
  }
  if (typeof handler !== "function") {
    throw new TypeError("Invalid handler. It should be a function:", handler);
  }
  return eventHandler((event) => {
    return callHandler(handler, event.req, event.res);
  });
}
function defineLazyEventHandler(factory) {
  let _promise;
  let _resolved;
  const resolveHandler = () => {
    if (_resolved) {
      return Promise.resolve(_resolved);
    }
    if (!_promise) {
      _promise = Promise.resolve(factory()).then((r) => {
        const handler = r.default || r;
        if (typeof handler !== "function") {
          throw new TypeError("Invalid lazy handler result. It should be a function:", handler);
        }
        _resolved = toEventHandler(r.default || r);
        return _resolved;
      });
    }
    return _promise;
  };
  return eventHandler((event) => {
    if (_resolved) {
      return _resolved(event);
    }
    return resolveHandler().then((handler) => handler(event));
  });
}
const lazyEventHandler = defineLazyEventHandler;

function createApp(options = {}) {
  const stack = [];
  const handler = createAppEventHandler(stack, options);
  const nodeHandler = async function(req, res) {
    const event = createEvent(req, res);
    try {
      await handler(event);
    } catch (_error) {
      const error = createError(_error);
      if (!isError(_error)) {
        error.unhandled = true;
      }
      if (options.onError) {
        await options.onError(error, event);
      } else {
        if (error.unhandled || error.fatal) {
          console.error("[h3]", error.fatal ? "[fatal]" : "[unhandled]", error);
        }
        await sendError(event, error, !!options.debug);
      }
    }
  };
  const app = nodeHandler;
  app.nodeHandler = nodeHandler;
  app.stack = stack;
  app.handler = handler;
  app.use = (arg1, arg2, arg3) => use(app, arg1, arg2, arg3);
  return app;
}
function use(app, arg1, arg2, arg3) {
  if (Array.isArray(arg1)) {
    arg1.forEach((i) => use(app, i, arg2, arg3));
  } else if (Array.isArray(arg2)) {
    arg2.forEach((i) => use(app, arg1, i, arg3));
  } else if (typeof arg1 === "string") {
    app.stack.push(normalizeLayer({ ...arg3, route: arg1, handler: arg2 }));
  } else if (typeof arg1 === "function") {
    app.stack.push(normalizeLayer({ ...arg2, route: "/", handler: arg1 }));
  } else {
    app.stack.push(normalizeLayer({ ...arg1 }));
  }
  return app;
}
function createAppEventHandler(stack, options) {
  const spacing = options.debug ? 2 : void 0;
  return eventHandler(async (event) => {
    event.req.originalUrl = event.req.originalUrl || event.req.url || "/";
    const reqUrl = event.req.url || "/";
    for (const layer of stack) {
      if (layer.route.length > 1) {
        if (!reqUrl.startsWith(layer.route)) {
          continue;
        }
        event.req.url = reqUrl.slice(layer.route.length) || "/";
      } else {
        event.req.url = reqUrl;
      }
      if (layer.match && !layer.match(event.req.url, event)) {
        continue;
      }
      const val = await layer.handler(event);
      if (event.res.writableEnded) {
        return;
      }
      const type = typeof val;
      if (type === "string") {
        return send(event, val, MIMES.html);
      } else if (isStream(val)) {
        return sendStream(event, val);
      } else if (val === null) {
        event.res.statusCode = 204;
        return send(event);
      } else if (type === "object" || type === "boolean" || type === "number") {
        if (val.buffer) {
          return send(event, val);
        } else if (val instanceof Error) {
          throw createError(val);
        } else {
          return send(event, JSON.stringify(val, null, spacing), MIMES.json);
        }
      }
    }
    if (!event.res.writableEnded) {
      throw createError({ statusCode: 404, statusMessage: "Not Found" });
    }
  });
}
function normalizeLayer(input) {
  let handler = input.handler || input.handle;
  if (handler.handler) {
    handler = handler.handler;
  }
  if (input.lazy) {
    handler = lazyEventHandler(handler);
  } else if (!isEventHandler(handler)) {
    handler = toEventHandler(handler);
  }
  return {
    route: withoutTrailingSlash(input.route),
    match: input.match,
    handler
  };
}

const RouterMethods = ["connect", "delete", "get", "head", "options", "post", "put", "trace", "patch"];
function createRouter() {
  const _router = createRouter$1({});
  const routes = {};
  const router = {};
  const addRoute = (path, handler, method) => {
    let route = routes[path];
    if (!route) {
      routes[path] = route = { handlers: {} };
      _router.insert(path, route);
    }
    if (Array.isArray(method)) {
      method.forEach((m) => addRoute(path, handler, m));
    } else {
      route.handlers[method] = toEventHandler(handler);
    }
    return router;
  };
  router.use = router.add = (path, handler, method) => addRoute(path, handler, method || "all");
  for (const method of RouterMethods) {
    router[method] = (path, handle) => router.add(path, handle, method);
  }
  router.handler = eventHandler((event) => {
    let path = event.req.url || "/";
    const queryUrlIndex = path.lastIndexOf("?");
    if (queryUrlIndex > -1) {
      path = path.substring(0, queryUrlIndex);
    }
    const matched = _router.lookup(path);
    if (!matched) {
      throw createError({
        statusCode: 404,
        name: "Not Found",
        statusMessage: `Cannot find any route matching ${event.req.url || "/"}.`
      });
    }
    const method = (event.req.method || "get").toLowerCase();
    const handler = matched.handlers[method] || matched.handlers.all;
    if (!handler) {
      throw createError({
        statusCode: 405,
        name: "Method Not Allowed",
        statusMessage: `Method ${method} is not allowed on this route.`
      });
    }
    const params = matched.params || {};
    event.event.context.params = params;
    event.req.context.params = params;
    return handler(event);
  });
  return router;
}

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
    "mtime": "2023-03-10T00:30:55.915Z",
    "size": 4286,
    "path": "../public/favicon.ico"
  },
  "/logo.svg": {
    "type": "image/svg+xml",
    "etag": "\"134-bsIgfzTLCe6ocIv1rihYHmaM7Ls\"",
    "mtime": "2023-03-10T00:30:55.906Z",
    "size": 308,
    "path": "../public/logo.svg"
  },
  "/manifest.json.br": {
    "type": "application/json",
    "encoding": "br",
    "etag": "\"3c1-97w3U636sAnaHvk5RBoJgajcWac\"",
    "mtime": "2023-03-10T00:30:55.788Z",
    "size": 961,
    "path": "../public/manifest.json.br"
  },
  "/manifest.webmanifest": {
    "type": "application/manifest+json",
    "etag": "\"2a3-Y5VGRZwJ3aSwxh2kSrPh0BKyMo8\"",
    "mtime": "2023-03-10T00:30:55.905Z",
    "size": 675,
    "path": "../public/manifest.webmanifest"
  },
  "/public-path.js": {
    "type": "application/javascript",
    "etag": "\"6e-5IFA6Z14JQLOy/P+MmN88/jDfN0\"",
    "mtime": "2023-03-10T00:30:55.903Z",
    "size": 110,
    "path": "../public/public-path.js"
  },
  "/qiankun-entry.js": {
    "type": "application/javascript",
    "etag": "\"25c-GB1+6OpRFjJNawsRxBLsyUQLrjs\"",
    "mtime": "2023-03-10T00:30:55.903Z",
    "size": 604,
    "path": "../public/qiankun-entry.js"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"58-dFNmoc0+6sM3GBLd+mn2nBnEUZU\"",
    "mtime": "2023-03-10T00:30:55.901Z",
    "size": 88,
    "path": "../public/robots.txt"
  },
  "/s.min.js": {
    "type": "application/javascript",
    "etag": "\"1e3e-IURe+8f29UiKSVLoy7+WNh665cA\"",
    "mtime": "2023-03-10T00:30:55.898Z",
    "size": 7742,
    "path": "../public/s.min.js"
  },
  "/s.min.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"aca-IfkzWSr51lZWQeCctWNtYFM+MHs\"",
    "mtime": "2023-03-10T00:30:55.748Z",
    "size": 2762,
    "path": "../public/s.min.js.br"
  },
  "/stats.html": {
    "type": "text/html; charset=utf-8",
    "etag": "\"ca59f-otlLVfcqKfoIQw9QSFBLWPuj6F0\"",
    "mtime": "2023-03-10T00:30:55.744Z",
    "size": 828831,
    "path": "../public/stats.html"
  },
  "/stats.html.br": {
    "type": "text/html; charset=utf-8",
    "encoding": "br",
    "etag": "\"14d48-PtqVFZFhMFB+MYLdRV+5CSh99MQ\"",
    "mtime": "2023-03-10T00:30:55.735Z",
    "size": 85320,
    "path": "../public/stats.html.br"
  },
  "/sw-dev.js": {
    "type": "application/javascript",
    "etag": "\"540-HTFuJXYvVcb3pgb6KI893BX45YU\"",
    "mtime": "2023-03-10T00:30:55.894Z",
    "size": 1344,
    "path": "../public/sw-dev.js"
  },
  "/sw-dev.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"1b7-EZTsXsvDf+C/yyKrPonx95SRE58\"",
    "mtime": "2023-03-10T00:30:55.728Z",
    "size": 439,
    "path": "../public/sw-dev.js.br"
  },
  "/sw-prod.js": {
    "type": "application/javascript",
    "etag": "\"463-B8se8COXjXaOeynh9kRT3zoJ7Jk\"",
    "mtime": "2023-03-10T00:30:55.893Z",
    "size": 1123,
    "path": "../public/sw-prod.js"
  },
  "/sw-prod.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"14b-KjRUzpJ6e0JdJP5/0YIGlmMIkwk\"",
    "mtime": "2023-03-10T00:30:55.725Z",
    "size": 331,
    "path": "../public/sw-prod.js.br"
  },
  "/_nuxt/OrderPopover.20fdf3a2.js": {
    "type": "application/javascript",
    "etag": "\"41b-6Ru2nc2v5PvIa0H45QOPathPsgE\"",
    "mtime": "2023-03-10T00:30:55.889Z",
    "size": 1051,
    "path": "../public/_nuxt/OrderPopover.20fdf3a2.js"
  },
  "/_nuxt/OrderPopover.20fdf3a2.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"266-cP65+YvQ7f4lek+qVFMVoytwklY\"",
    "mtime": "2023-03-10T00:30:55.887Z",
    "size": 614,
    "path": "../public/_nuxt/OrderPopover.20fdf3a2.js.br"
  },
  "/_nuxt/OrderPopover.dd3e9913.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"a70-ry66MS+dvDTmyBn3c4+PGpehaMw\"",
    "mtime": "2023-03-10T00:30:55.886Z",
    "size": 2672,
    "path": "../public/_nuxt/OrderPopover.dd3e9913.css"
  },
  "/_nuxt/OrderPopover.dd3e9913.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"280-z6OnpFlN1aeRJzHY8xHhpp2JBiU\"",
    "mtime": "2023-03-10T00:30:55.881Z",
    "size": 640,
    "path": "../public/_nuxt/OrderPopover.dd3e9913.css.br"
  },
  "/_nuxt/_id_.0ff06d40.js": {
    "type": "application/javascript",
    "etag": "\"1868-O75ngi9omZH6c7A7zK4G8/DZA5I\"",
    "mtime": "2023-03-10T00:30:55.879Z",
    "size": 6248,
    "path": "../public/_nuxt/_id_.0ff06d40.js"
  },
  "/_nuxt/_id_.0ff06d40.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"a81-NTXRBcgLX9rsarMFTOQ5g4nQrVg\"",
    "mtime": "2023-03-10T00:30:55.872Z",
    "size": 2689,
    "path": "../public/_nuxt/_id_.0ff06d40.js.br"
  },
  "/_nuxt/_id_.9d540f04.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"117c-6oxRjZu6IjIsA+RMCUR+j/GmH7Y\"",
    "mtime": "2023-03-10T00:30:55.870Z",
    "size": 4476,
    "path": "../public/_nuxt/_id_.9d540f04.css"
  },
  "/_nuxt/_id_.9d540f04.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"407-mV146SSwWEtike/czxDFHHUWDP8\"",
    "mtime": "2023-03-10T00:30:55.869Z",
    "size": 1031,
    "path": "../public/_nuxt/_id_.9d540f04.css.br"
  },
  "/_nuxt/_plugin-vue_export-helper.a1a6add7.js": {
    "type": "application/javascript",
    "etag": "\"5b-SqaToq/MNLald+G/xL4+9aRY3OA\"",
    "mtime": "2023-03-10T00:30:55.868Z",
    "size": 91,
    "path": "../public/_nuxt/_plugin-vue_export-helper.a1a6add7.js"
  },
  "/_nuxt/auth.a6dc85e6.js": {
    "type": "application/javascript",
    "etag": "\"99-bEEXie/2KbrUL/KqVnIwUsJVcUE\"",
    "mtime": "2023-03-10T00:30:55.868Z",
    "size": 153,
    "path": "../public/_nuxt/auth.a6dc85e6.js"
  },
  "/_nuxt/banner.d75e2f5e.jpg": {
    "type": "image/jpeg",
    "etag": "\"cd58-7qjae7h8JmXqZAQWBFK0/ESM2t8\"",
    "mtime": "2023-03-10T00:30:55.860Z",
    "size": 52568,
    "path": "../public/_nuxt/banner.d75e2f5e.jpg"
  },
  "/_nuxt/bg.ec928e8e.png": {
    "type": "image/png",
    "etag": "\"ce80-aHiilpNymn84BFNT4vNZfcv3xnE\"",
    "mtime": "2023-03-10T00:30:55.858Z",
    "size": 52864,
    "path": "../public/_nuxt/bg.ec928e8e.png"
  },
  "/_nuxt/en.df668989.js": {
    "type": "application/javascript",
    "etag": "\"5d0-J8gQkx+XLG7ouy4XaAFSGxMOW3I\"",
    "mtime": "2023-03-10T00:30:55.856Z",
    "size": 1488,
    "path": "../public/_nuxt/en.df668989.js"
  },
  "/_nuxt/en.df668989.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"298-xMNmBwzJkXOKG2rvfBmyYd3hum4\"",
    "mtime": "2023-03-10T00:30:55.855Z",
    "size": 664,
    "path": "../public/_nuxt/en.df668989.js.br"
  },
  "/_nuxt/entry.612ba306.js": {
    "type": "application/javascript",
    "etag": "\"7b6a7-V4O/kfmNuobm7AaGsKXH9e9JvKg\"",
    "mtime": "2023-03-10T00:30:55.853Z",
    "size": 505511,
    "path": "../public/_nuxt/entry.612ba306.js"
  },
  "/_nuxt/entry.612ba306.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"22f0f-L/1AkCuT3rYw46xGR/ig//pFom8\"",
    "mtime": "2023-03-10T00:30:55.850Z",
    "size": 143119,
    "path": "../public/_nuxt/entry.612ba306.js.br"
  },
  "/_nuxt/entry.ff46037e.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"1d7e6-BoM+/lwTvdgMCHfhB5v99WLykRE\"",
    "mtime": "2023-03-10T00:30:55.848Z",
    "size": 120806,
    "path": "../public/_nuxt/entry.ff46037e.css"
  },
  "/_nuxt/entry.ff46037e.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"391f-W/a5LtsB8qjlazWX36grWefI1y4\"",
    "mtime": "2023-03-10T00:30:55.845Z",
    "size": 14623,
    "path": "../public/_nuxt/entry.ff46037e.css.br"
  },
  "/_nuxt/error-404.64a74fcd.js": {
    "type": "application/javascript",
    "etag": "\"8e0-wbHv6p//tcLOXOUewmyFaH88E+I\"",
    "mtime": "2023-03-10T00:30:55.843Z",
    "size": 2272,
    "path": "../public/_nuxt/error-404.64a74fcd.js"
  },
  "/_nuxt/error-404.64a74fcd.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"3ef-8i3brtdZ34BJot0HV6Az1Ia2s4g\"",
    "mtime": "2023-03-10T00:30:55.843Z",
    "size": 1007,
    "path": "../public/_nuxt/error-404.64a74fcd.js.br"
  },
  "/_nuxt/error-404.92e2ae27.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"11db-9L5wSbUJsrhewS7SeeHZa22aKQk\"",
    "mtime": "2023-03-10T00:30:55.842Z",
    "size": 4571,
    "path": "../public/_nuxt/error-404.92e2ae27.css"
  },
  "/_nuxt/error-404.92e2ae27.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"44f-kzOXBgpaZhWu96esWmrfBEk8Bjw\"",
    "mtime": "2023-03-10T00:30:55.840Z",
    "size": 1103,
    "path": "../public/_nuxt/error-404.92e2ae27.css.br"
  },
  "/_nuxt/error-500.a37341a2.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"7c9-LmK19WNMTpu90sLhyYp/k4Ra96g\"",
    "mtime": "2023-03-10T00:30:55.840Z",
    "size": 1993,
    "path": "../public/_nuxt/error-500.a37341a2.css"
  },
  "/_nuxt/error-500.a37341a2.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"281-x6WxtYWypuQy2oCbEHpmrU3fURU\"",
    "mtime": "2023-03-10T00:30:55.839Z",
    "size": 641,
    "path": "../public/_nuxt/error-500.a37341a2.css.br"
  },
  "/_nuxt/error-500.ab8a9a88.js": {
    "type": "application/javascript",
    "etag": "\"787-wRq63MZwr9ImD7bluVytM8myYiE\"",
    "mtime": "2023-03-10T00:30:55.838Z",
    "size": 1927,
    "path": "../public/_nuxt/error-500.ab8a9a88.js"
  },
  "/_nuxt/error-500.ab8a9a88.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"36a-mVrbI40JM6TAJscO4M/LcpQQDEM\"",
    "mtime": "2023-03-10T00:30:55.836Z",
    "size": 874,
    "path": "../public/_nuxt/error-500.ab8a9a88.js.br"
  },
  "/_nuxt/error-component.f3209383.js": {
    "type": "application/javascript",
    "etag": "\"4c2-iqGPxD+yVNjkZ5yKor61zR/2sUc\"",
    "mtime": "2023-03-10T00:30:55.835Z",
    "size": 1218,
    "path": "../public/_nuxt/error-component.f3209383.js"
  },
  "/_nuxt/error-component.f3209383.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"22a-ZYJDknR69lew8DluuYt8MpNYxZ8\"",
    "mtime": "2023-03-10T00:30:55.834Z",
    "size": 554,
    "path": "../public/_nuxt/error-component.f3209383.js.br"
  },
  "/_nuxt/index.89327619.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"cb9-vSNSRTHWFHnLPkvX5TArp4jl76k\"",
    "mtime": "2023-03-10T00:30:55.833Z",
    "size": 3257,
    "path": "../public/_nuxt/index.89327619.css"
  },
  "/_nuxt/index.89327619.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"33a-S/3JQ2511H9mBzHaETvJeEJcDV4\"",
    "mtime": "2023-03-10T00:30:55.832Z",
    "size": 826,
    "path": "../public/_nuxt/index.89327619.css.br"
  },
  "/_nuxt/index.9f96a006.js": {
    "type": "application/javascript",
    "etag": "\"e14-OsmJD6cnSE0ID0k01jVCbW/Kvkk\"",
    "mtime": "2023-03-10T00:30:55.831Z",
    "size": 3604,
    "path": "../public/_nuxt/index.9f96a006.js"
  },
  "/_nuxt/index.9f96a006.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"5d3-VTGqQxhFSrZ4vUQ0CvvDDULTau8\"",
    "mtime": "2023-03-10T00:30:55.830Z",
    "size": 1491,
    "path": "../public/_nuxt/index.9f96a006.js.br"
  },
  "/_nuxt/login.01d9ad1b.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"c7a-XNepyxOTTw+KHw+03G1DHR2sRsA\"",
    "mtime": "2023-03-10T00:30:55.829Z",
    "size": 3194,
    "path": "../public/_nuxt/login.01d9ad1b.css"
  },
  "/_nuxt/login.01d9ad1b.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"29e-RKk6dJOZTh6JJpGWvpsCBaAZrEM\"",
    "mtime": "2023-03-10T00:30:55.828Z",
    "size": 670,
    "path": "../public/_nuxt/login.01d9ad1b.css.br"
  },
  "/_nuxt/login.6b076230.js": {
    "type": "application/javascript",
    "etag": "\"9e9-lx6HwY8kV4ZDnDUvvzAl7V4X/D0\"",
    "mtime": "2023-03-10T00:30:55.827Z",
    "size": 2537,
    "path": "../public/_nuxt/login.6b076230.js"
  },
  "/_nuxt/login.6b076230.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"3e2-VJY+RmfjymS0RRi7nsiO3twJy0Q\"",
    "mtime": "2023-03-10T00:30:55.826Z",
    "size": 994,
    "path": "../public/_nuxt/login.6b076230.js.br"
  },
  "/_nuxt/logo.a0bc2137.png": {
    "type": "image/png",
    "etag": "\"1056-2kUmWzZ74wqhfz9e5gswxDWN9/c\"",
    "mtime": "2023-03-10T00:30:55.825Z",
    "size": 4182,
    "path": "../public/_nuxt/logo.a0bc2137.png"
  },
  "/_nuxt/record.11815c1f.js": {
    "type": "application/javascript",
    "etag": "\"54e-cnpN9ovVQmxRtylkC2tSbBJeE1E\"",
    "mtime": "2023-03-10T00:30:55.824Z",
    "size": 1358,
    "path": "../public/_nuxt/record.11815c1f.js"
  },
  "/_nuxt/record.11815c1f.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"2a0-o1jDDFUcNLZ8eYpv2zGEwWQxhT0\"",
    "mtime": "2023-03-10T00:30:55.823Z",
    "size": 672,
    "path": "../public/_nuxt/record.11815c1f.js.br"
  },
  "/_nuxt/record.f669cfa4.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"5ff-y0hw9m29JNpTSvxFJUhXsI6jBv8\"",
    "mtime": "2023-03-10T00:30:55.821Z",
    "size": 1535,
    "path": "../public/_nuxt/record.f669cfa4.css"
  },
  "/_nuxt/record.f669cfa4.css.br": {
    "type": "text/css; charset=utf-8",
    "encoding": "br",
    "etag": "\"1bf-J6E7q35vxp8Wlv/ksyobT3q0cHk\"",
    "mtime": "2023-03-10T00:30:55.820Z",
    "size": 447,
    "path": "../public/_nuxt/record.f669cfa4.css.br"
  },
  "/_nuxt/useFetchRoom.d9c735df.js": {
    "type": "application/javascript",
    "etag": "\"d9b-YVfIGU623AyFuo0rxptIKZjpJkc\"",
    "mtime": "2023-03-10T00:30:55.819Z",
    "size": 3483,
    "path": "../public/_nuxt/useFetchRoom.d9c735df.js"
  },
  "/_nuxt/useFetchRoom.d9c735df.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"55a-3AG42koZDObxWl+suCyXoMedru0\"",
    "mtime": "2023-03-10T00:30:55.816Z",
    "size": 1370,
    "path": "../public/_nuxt/useFetchRoom.d9c735df.js.br"
  },
  "/_nuxt/zh-cn.8b0ed509.js": {
    "type": "application/javascript",
    "etag": "\"796-dLked4c9p1J7sJlJD4iDkd8Vj6U\"",
    "mtime": "2023-03-10T00:30:55.815Z",
    "size": 1942,
    "path": "../public/_nuxt/zh-cn.8b0ed509.js"
  },
  "/_nuxt/zh-cn.8b0ed509.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"313-xZ+ufccnbF0V6cHIpG3soVKtzcM\"",
    "mtime": "2023-03-10T00:30:55.811Z",
    "size": 787,
    "path": "../public/_nuxt/zh-cn.8b0ed509.js.br"
  },
  "/_nuxt/zh.77210e57.js": {
    "type": "application/javascript",
    "etag": "\"5af-3XpOsJ3acLi9u30N5KEU9Wee/VI\"",
    "mtime": "2023-03-10T00:30:55.809Z",
    "size": 1455,
    "path": "../public/_nuxt/zh.77210e57.js"
  },
  "/_nuxt/zh.77210e57.js.br": {
    "type": "application/javascript",
    "encoding": "br",
    "etag": "\"2e8-FV9K06TqM3De1SSONOKoaJZTU+I\"",
    "mtime": "2023-03-10T00:30:55.807Z",
    "size": 744,
    "path": "../public/_nuxt/zh.77210e57.js.br"
  },
  "/icons/icon-192x192.png": {
    "type": "image/png",
    "etag": "\"29c4-NriTNBvcWHJR3YBDt//tAO+yuMA\"",
    "mtime": "2023-03-10T00:30:55.912Z",
    "size": 10692,
    "path": "../public/icons/icon-192x192.png"
  },
  "/icons/icon-512x512.png": {
    "type": "image/png",
    "etag": "\"9168-9ij8zOTFXbV2adspote6EXEhxnA\"",
    "mtime": "2023-03-10T00:30:55.910Z",
    "size": 37224,
    "path": "../public/icons/icon-512x512.png"
  },
  "/icons/icon_light.svg": {
    "type": "image/svg+xml",
    "etag": "\"a5f-LpV+6vuG7YNr+ezVO8vkv0Df+nY\"",
    "mtime": "2023-03-10T00:30:55.908Z",
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
	"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs": {
	resourceType: "script",
	module: true,
	file: "entry.612ba306.js",
	src: "node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
	isEntry: true,
	dynamicImports: [
		"pages/detail/[id].vue",
		"pages/index.vue",
		"pages/login.vue",
		"pages/record.vue",
		"middleware/auth.ts",
		"node_modules/.pnpm/element-plus@2.2.36_vue@3.2.47/node_modules/element-plus/es/locale/lang/zh-cn.mjs",
		"common/i18n/en.ts",
		"common/i18n/zh.ts",
		"virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/awesome/nuxt-ssr/.nuxt/error-component.mjs",
		"components/order/OrderPopover.vue"
	],
	css: [
		"entry.ff46037e.css"
	],
	assets: [
		"logo.a0bc2137.png"
	]
},
	"entry.ff46037e.css": {
	file: "entry.ff46037e.css",
	resourceType: "style"
},
	"logo.a0bc2137.png": {
	file: "logo.a0bc2137.png",
	resourceType: "image",
	mimeType: "image/png"
},
	"virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/awesome/nuxt-ssr/.nuxt/error-component.mjs": {
	resourceType: "script",
	module: true,
	file: "error-component.f3209383.js",
	src: "virtual:nuxt:/Users/zhaoyimin/yiminfe/vue3/awesome/nuxt-ssr/.nuxt/error-component.mjs",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs"
	],
	dynamicImports: [
		"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue",
		"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue"
	]
},
	"pages/detail/[id].vue": {
	resourceType: "script",
	module: true,
	file: "_id_.0ff06d40.js",
	src: "pages/detail/[id].vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
		"_useFetchRoom.d9c735df.js"
	],
	css: [
		"_id_.9d540f04.css"
	]
},
	"_id_.9d540f04.css": {
	file: "_id_.9d540f04.css",
	resourceType: "style"
},
	"_useFetchRoom.d9c735df.js": {
	resourceType: "script",
	module: true,
	file: "useFetchRoom.d9c735df.js",
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs"
	]
},
	"pages/index.vue": {
	resourceType: "script",
	module: true,
	file: "index.9f96a006.js",
	src: "pages/index.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
		"_useFetchRoom.d9c735df.js"
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
	file: "login.6b076230.js",
	src: "pages/login.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs"
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
	file: "record.11815c1f.js",
	src: "pages/record.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs"
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
	file: "auth.a6dc85e6.js",
	src: "middleware/auth.ts",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs"
	]
},
	"components/order/OrderPopover.vue": {
	resourceType: "script",
	module: true,
	file: "OrderPopover.20fdf3a2.js",
	src: "components/order/OrderPopover.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
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
	"node_modules/.pnpm/element-plus@2.2.36_vue@3.2.47/node_modules/element-plus/es/locale/lang/zh-cn.mjs": {
	resourceType: "script",
	module: true,
	file: "zh-cn.8b0ed509.js",
	src: "node_modules/.pnpm/element-plus@2.2.36_vue@3.2.47/node_modules/element-plus/es/locale/lang/zh-cn.mjs",
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
	file: "error-404.64a74fcd.js",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
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
	file: "error-500.ab8a9a88.js",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.vue",
	isDynamicEntry: true,
	imports: [
		"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.mjs",
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
	"pages/index.css": {
	resourceType: "style",
	file: "index.89327619.css",
	src: "pages/index.css"
},
	"pages/detail/[id].css": {
	resourceType: "style",
	file: "_id_.9d540f04.css",
	src: "pages/detail/[id].css"
},
	"pages/login.css": {
	resourceType: "style",
	file: "login.01d9ad1b.css",
	src: "pages/login.css"
},
	"pages/record.css": {
	resourceType: "style",
	file: "record.f669cfa4.css",
	src: "pages/record.css"
},
	"components/order/OrderPopover.css": {
	resourceType: "style",
	file: "OrderPopover.dd3e9913.css",
	src: "components/order/OrderPopover.css"
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.css": {
	resourceType: "style",
	file: "error-404.92e2ae27.css",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-404.css"
},
	"node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.css": {
	resourceType: "style",
	file: "error-500.a37341a2.css",
	src: "node_modules/.pnpm/@nuxt+ui-templates@0.4.0/node_modules/@nuxt/ui-templates/dist/templates/error-500.css"
},
	"node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.css": {
	resourceType: "style",
	file: "entry.ff46037e.css",
	src: "node_modules/.pnpm/nuxt@3.0.0-rc.11_xiwtsdcktezlxg6zlflodwg3h4/node_modules/nuxt/dist/app/entry.css"
}
};

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
const _bW1jn1 = defineEventHandler((event) => {
  console.log("\u8FDB\u5165\u4E86interceptor\u4E2D\u95F4\u4EF6");
  const { res } = event;
  const originalEnd = res.end;
  res.end = (html) => {
    let newHtml = html;
    {
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

const _D5P5CK = defineEventHandler((event) => {
  const { res } = event;
  res.setHeader("Access-Control-Allow-Origin", "*");
});

const _lazy_ew03nA = () => import('../handlers/renderer.mjs');

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _bW1jn1, lazy: false, middleware: true, method: undefined },
  { route: '', handler: _D5P5CK, lazy: false, middleware: true, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_ew03nA, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_ew03nA, lazy: true, middleware: false, method: undefined }
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

export { useRuntimeConfig as a, appendHeader as b, createError as c, eventHandler as e, getQuery as g, nodeServer as n, sendRedirect as s, useNitroApp as u };
//# sourceMappingURL=node-server.mjs.map
