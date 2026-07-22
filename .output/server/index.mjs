globalThis.__nitro_main__ = import.meta.url;
import { a as FastResponse, n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { t as HookableCore } from "./_libs/hookable.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"4f95-3RXc3p2mhEAs1WBwaIvE0Y0uu0Y\"",
		"mtime": "2026-07-22T16:24:04.993Z",
		"size": 20373,
		"path": "../public/favicon.ico"
	},
	"/assets/AppShell-CvFR-8E7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a13-WFDKwrVup1Ez0nQR4TtuRaH6pEg\"",
		"mtime": "2026-07-22T16:24:02.621Z",
		"size": 2579,
		"path": "../public/assets/AppShell-CvFR-8E7.js"
	},
	"/assets/Match-CFSiyOr3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"be05-NsuLhKm/aL52CfztKUMj8Q2ob48\"",
		"mtime": "2026-07-22T16:24:02.623Z",
		"size": 48645,
		"path": "../public/assets/Match-CFSiyOr3.js"
	},
	"/assets/_id-C1L1xrL9.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2bad-9jzt+1sNe1nFGv2pDMsYpAaV1Gs\"",
		"mtime": "2026-07-22T16:24:02.626Z",
		"size": 11181,
		"path": "../public/assets/_id-C1L1xrL9.js"
	},
	"/assets/auth-3Yld9WxG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1212-Kga/eAy01xOQ3y6zC0onJJOu+H4\"",
		"mtime": "2026-07-22T16:24:02.627Z",
		"size": 4626,
		"path": "../public/assets/auth-3Yld9WxG.js"
	},
	"/assets/client-TyPpd_2_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"34553-RNz6FlShcMXXmWdc6E/RStORbEo\"",
		"mtime": "2026-07-22T16:24:02.631Z",
		"size": 214355,
		"path": "../public/assets/client-TyPpd_2_.js"
	},
	"/assets/index-DH_vE37A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"55d34-ShbN9BKTovYbs7tlwokl5+2vpAM\"",
		"mtime": "2026-07-22T16:24:02.615Z",
		"size": 351540,
		"path": "../public/assets/index-DH_vE37A.js"
	},
	"/assets/inventory-C_4TbKGK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14b7-uUTMPnms5DK5LzrO6QqB5eEcc6o\"",
		"mtime": "2026-07-22T16:24:02.632Z",
		"size": 5303,
		"path": "../public/assets/inventory-C_4TbKGK.js"
	},
	"/assets/matchContext-Co2j0WZo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8b-FguPuy6XjgSashw5GspKVLd74MI\"",
		"mtime": "2026-07-22T16:24:02.632Z",
		"size": 139,
		"path": "../public/assets/matchContext-Co2j0WZo.js"
	},
	"/assets/play-CUE-6ioB.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d98-rqaPsz6VP8KmbRbgfqwlSbaqtLY\"",
		"mtime": "2026-07-22T16:24:02.633Z",
		"size": 7576,
		"path": "../public/assets/play-CUE-6ioB.js"
	},
	"/assets/redirect-1Dss4sOM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"216-AhfiXwQqYdLrM+uQAOtPHfIddmI\"",
		"mtime": "2026-07-22T16:24:02.636Z",
		"size": 534,
		"path": "../public/assets/redirect-1Dss4sOM.js"
	},
	"/assets/route-CmwWnDO5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8a-7zuPTRhkJFG13Bv8CwcUNi1Fjzs\"",
		"mtime": "2026-07-22T16:24:02.637Z",
		"size": 138,
		"path": "../public/assets/route-CmwWnDO5.js"
	},
	"/assets/routes-Brq6Th5o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"acb-EGPq6DIbst7MNOrnBdk3hIVxT9Q\"",
		"mtime": "2026-07-22T16:24:02.640Z",
		"size": 2763,
		"path": "../public/assets/routes-Brq6Th5o.js"
	},
	"/assets/styles-DqqoSqnP.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"13341-SWwUiMeGMGlwG5kMRJgUvlCZ3oQ\"",
		"mtime": "2026-07-22T16:24:02.641Z",
		"size": 78657,
		"path": "../public/assets/styles-DqqoSqnP.css"
	},
	"/assets/useStore-BI3_Wmfo.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6b93-HMub9X0Xk4uow+36/yEAO0F56I4\"",
		"mtime": "2026-07-22T16:24:02.641Z",
		"size": 27539,
		"path": "../public/assets/useStore-BI3_Wmfo.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_hBn8Kl = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_hBn8Kl
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) return hooks;
	return nitroApp.hooks = new HookableCore();
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function createHandler(hooks) {
	const nitroApp = useNitroApp();
	const nitroHooks = useNitroHooks();
	return {
		async fetch(request, env, context) {
			globalThis.__env__ = env;
			augmentReq(request, {
				env,
				context
			});
			const ctxExt = {};
			const url = new URL(request.url);
			if (hooks.fetch) {
				const res = await hooks.fetch(request, env, context, url, ctxExt);
				if (res) return res;
			}
			return await nitroApp.fetch(request);
		},
		scheduled(controller, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:scheduled", {
				controller,
				env,
				context
			}) || Promise.resolve());
		},
		email(message, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:email", {
				message,
				event: message,
				env,
				context
			}) || Promise.resolve());
		},
		queue(batch, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:queue", {
				batch,
				event: batch,
				env,
				context
			}) || Promise.resolve());
		},
		tail(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:tail", {
				traces,
				env,
				context
			}) || Promise.resolve());
		},
		trace(traces, env, context) {
			globalThis.__env__ = env;
			context.waitUntil(nitroHooks.callHook("cloudflare:trace", {
				traces,
				env,
				context
			}) || Promise.resolve());
		}
	};
}
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-module.mjs
var cloudflare_module_default = createHandler({ fetch(cfRequest, env, context, url) {
	if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfRequest);
} });
//#endregion
export { cloudflare_module_default as default };
