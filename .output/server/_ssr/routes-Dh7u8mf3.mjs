import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Dh7u8mf3.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Landing() {
	const [signedIn, setSignedIn] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center justify-between px-6 py-5 md:px-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-2xl",
					children: "🎲"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-display text-xl font-bold",
					children: "BET MONEY"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/play",
					className: "btn-gold",
					children: "Enter the lobby"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					className: "btn-ghost",
					children: "Sign in"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/auth",
					search: { mode: "signup" },
					className: "btn-gold",
					children: "Create account"
				})] })
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-4xl px-6 pt-10 pb-24 md:pt-20 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "chip",
					children: "100% fake money · 100% real bragging"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-6 font-display text-5xl md:text-7xl font-black leading-[0.95]",
					children: [
						"Bid absurd things",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
						"with your ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[color:var(--felt)]",
							children: "friends"
						}),
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mx-auto mt-6 max-w-xl text-lg text-muted-foreground",
					children: [
						"Everyone starts with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "1000 BET MONEY" }),
						". Host a live auction, pick an item, and watch your friends fight over a haunted toaster in a real bidding room. Win it, then flip it on the market."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8 flex flex-wrap justify-center gap-3",
					children: signedIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/play",
						className: "btn-gold text-base",
						children: "Enter the auction lobby →"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/auth",
						search: { mode: "signup" },
						className: "btn-gold text-base",
						children: "Grab your 1000 BET MONEY →"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-16 grid gap-4 md:grid-cols-3",
					children: [
						{
							emoji: "🎩",
							title: "Host an auction",
							body: "Open a bidding room. You get 3 mystery items — pick one and the war begins."
						},
						{
							emoji: "💸",
							title: "Live bidding room",
							body: "Join any active auction. 45-second rounds, last bids in the final 10s extend the clock."
						},
						{
							emoji: "🏷️",
							title: "Flip it",
							body: "List anything you own on the market. Turn 12 BET MONEY into 200."
						}
					].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-6 text-left transition hover:-translate-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl",
								children: c.emoji
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-3 font-display text-xl font-bold",
								children: c.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: c.body
							})
						]
					}, c.title))
				})
			]
		})]
	});
}
//#endregion
export { Landing as component };
