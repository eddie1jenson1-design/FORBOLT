import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./AppShell-CZiMROu7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/inventory-BfbcNuwH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InventoryPage() {
	const [userId, setUserId] = (0, import_react.useState)(null);
	const [items, setItems] = (0, import_react.useState)({});
	const [profiles, setProfiles] = (0, import_react.useState)({});
	const [mine, setMine] = (0, import_react.useState)([]);
	const [market, setMarket] = (0, import_react.useState)([]);
	const [tab, setTab] = (0, import_react.useState)("mine");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [listPrice, setListPrice] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
	}, []);
	const load = async () => {
		const [{ data: its }, { data: ps }, { data: inv }] = await Promise.all([
			supabase.from("items").select("*"),
			supabase.from("profiles").select("id, username, avatar_emoji"),
			supabase.from("inventory").select("*").order("acquired_at", { ascending: false })
		]);
		if (its) setItems(Object.fromEntries(its.map((x) => [x.id, x])));
		if (ps) setProfiles(Object.fromEntries(ps.map((p) => [p.id, p])));
		if (inv) {
			const all = inv;
			setMine(all.filter((i) => i.owner_id === userId));
			setMarket(all.filter((i) => i.listed_price != null && i.owner_id !== userId).map((i) => ({
				...i,
				owner_username: profiles[i.owner_id]?.username ?? "someone",
				owner_avatar: profiles[i.owner_id]?.avatar_emoji ?? "🎲"
			})));
		}
	};
	(0, import_react.useEffect)(() => {
		if (userId) load();
	}, [userId]);
	(0, import_react.useEffect)(() => {
		const ch = supabase.channel("inv-market").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "inventory"
		}, () => load()).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "profiles"
		}, () => load()).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [userId]);
	const listItem = async (invId) => {
		if (listPrice === "" || listPrice < 1) {
			toast.error("Enter a price ≥ 1");
			return;
		}
		setBusy(true);
		const { error } = await supabase.from("inventory").update({ listed_price: Number(listPrice) }).eq("id", invId);
		if (error) toast.error(error.message);
		else {
			toast.success("Listed on the market!");
			setEditing(null);
			setListPrice("");
		}
		setBusy(false);
	};
	const unlist = async (invId) => {
		const { error } = await supabase.from("inventory").update({ listed_price: null }).eq("id", invId);
		if (error) toast.error(error.message);
		else toast.success("Removed from market");
	};
	const buy = async (invId) => {
		setBusy(true);
		const { error } = await supabase.rpc("buy_listed", { _inventory_id: invId });
		if (error) toast.error(error.message);
		else toast.success("Purchased! It's in your inventory.");
		setBusy(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 border-b border-border pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab("mine"),
				className: tab === "mine" ? "btn-gold" : "btn-ghost",
				children: "🎒 My Stuff"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setTab("market"),
				className: tab === "market" ? "btn-gold" : "btn-ghost",
				children: "🏷️ Market"
			})]
		}),
		tab === "mine" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: mine.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-5xl",
					children: "📭"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "You don't own anything yet. Win an auction or buy from the Market."
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: mine.map((inv) => {
					const item = items[inv.item_id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-4xl",
									children: item?.emoji ?? "❓"
								}), inv.listed_price != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "chip !bg-[color:var(--felt)] !text-white",
									children: [
										"listed ",
										inv.listed_price,
										" BM"
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-lg font-bold",
								children: item?.name ?? "Unknown"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: item?.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: [
									"Acquired for ",
									inv.acquired_price,
									" BM"
								]
							}),
							editing === inv.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "number",
										value: listPrice,
										onChange: (e) => setListPrice(e.target.value === "" ? "" : Number(e.target.value)),
										placeholder: "Price",
										min: 1,
										className: "w-full rounded-lg border border-input bg-card px-3 py-2 outline-none focus:border-[color:var(--gold)]"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => listItem(inv.id),
										disabled: busy,
										className: "btn-gold",
										children: "List"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => {
											setEditing(null);
											setListPrice("");
										},
										className: "btn-ghost",
										children: "Cancel"
									})
								]
							}) : inv.listed_price != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => unlist(inv.id),
								className: "btn-ghost mt-3 w-full",
								children: "Remove from market"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => {
									setEditing(inv.id);
									setListPrice("");
								},
								className: "btn-primary mt-3 w-full",
								children: "List for sale →"
							})
						]
					}, inv.id);
				})
			})
		}),
		tab === "market" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6",
			children: market.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-10 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-5xl",
					children: "🏪"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Nothing for sale right now. Win an auction and list it!"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: market.map((inv) => {
					const item = items[inv.item_id];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "panel p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-4xl",
									children: item?.emoji ?? "❓"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "chip",
									children: [
										inv.owner_avatar,
										" @",
										inv.owner_username
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-2 font-display text-lg font-bold",
								children: item?.name ?? "Unknown"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-0.5 text-xs text-muted-foreground",
								children: item?.description
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-display text-2xl font-black",
									children: [
										inv.listed_price,
										" ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm",
											children: "BM"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => buy(inv.id),
									disabled: busy,
									className: "btn-gold",
									children: "Buy →"
								})]
							})
						]
					}, inv.id);
				})
			})
		})
	] });
}
//#endregion
export { InventoryPage as component };
