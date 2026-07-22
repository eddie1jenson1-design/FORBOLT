import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AppShell-CZiMROu7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AppShell({ children }) {
	const [profile, setProfile] = (0, import_react.useState)(null);
	const navigate = useNavigate();
	const path = useRouterState({ select: (s) => s.location.pathname });
	(0, import_react.useEffect)(() => {
		let mounted = true;
		const load = async () => {
			const { data: u } = await supabase.auth.getUser();
			if (!u.user) return;
			const { data } = await supabase.from("profiles").select("username, balance, avatar_emoji").eq("id", u.user.id).maybeSingle();
			if (mounted && data) setProfile(data);
		};
		load();
		const channel = supabase.channel("profile-balance").on("postgres_changes", {
			event: "UPDATE",
			schema: "public",
			table: "profiles"
		}, () => load()).subscribe();
		return () => {
			mounted = false;
			supabase.removeChannel(channel);
		};
	}, []);
	const signOut = async () => {
		await supabase.auth.signOut();
		toast.success("Signed out");
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/play",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-2xl",
							children: "🎲"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg font-bold",
							children: "BET MONEY"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "hidden gap-1 md:flex",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/play",
							className: `btn-ghost ${path === "/play" ? "bg-secondary" : ""}`,
							children: "Auction Lobby"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/inventory",
							className: `btn-ghost ${path === "/inventory" ? "bg-secondary" : ""}`,
							children: "My Stuff & Market"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [profile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden items-center gap-1.5 text-sm font-semibold md:inline-flex",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-lg",
								children: profile.avatar_emoji
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["@", profile.username] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "money-chip",
							children: [
								"💰 ",
								profile.balance.toLocaleString(),
								" BM"
							]
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: signOut,
							className: "btn-ghost",
							children: "Sign out"
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				className: "flex gap-1 border-t border-border/60 px-4 py-2 md:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/play",
					className: `btn-ghost flex-1 ${path === "/play" ? "bg-secondary" : ""}`,
					children: "Lobby"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/inventory",
					className: `btn-ghost flex-1 ${path === "/inventory" ? "bg-secondary" : ""}`,
					children: "Stuff & Market"
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10",
			children
		})]
	});
}
//#endregion
export { AppShell as t };
