import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as AppShell } from "./AppShell-CZiMROu7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/play-Dz7UM2U4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayPage() {
	const navigate = useNavigate();
	const [userId, setUserId] = (0, import_react.useState)(null);
	const [items, setItems] = (0, import_react.useState)({});
	const [profiles, setProfiles] = (0, import_react.useState)({});
	const [rounds, setRounds] = (0, import_react.useState)([]);
	const [participants, setParticipants] = (0, import_react.useState)([]);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const [starting, setStarting] = (0, import_react.useState)(false);
	const [title, setTitle] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
	}, []);
	(0, import_react.useEffect)(() => {
		const i = setInterval(() => setNow(Date.now()), 500);
		return () => clearInterval(i);
	}, []);
	(0, import_react.useEffect)(() => {
		(async () => {
			const [{ data: it }, { data: rs }, { data: ps }, { data: parts }] = await Promise.all([
				supabase.from("items").select("*"),
				supabase.from("rounds").select("*").order("created_at", { ascending: false }).limit(30),
				supabase.from("profiles").select("id, username, balance, avatar_emoji"),
				supabase.from("round_participants").select("*")
			]);
			if (it) setItems(Object.fromEntries(it.map((x) => [x.id, x])));
			if (rs) setRounds(rs);
			if (ps) setProfiles(Object.fromEntries(ps.map((p) => [p.id, p])));
			if (parts) setParticipants(parts);
		})();
		const ch = supabase.channel("play-lobby").on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "rounds"
		}, (payload) => {
			setRounds((prev) => {
				const row = payload.new;
				if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== payload.old.id);
				if (!prev.some((r) => r.id === row.id)) return [row, ...prev].slice(0, 30);
				return prev.map((r) => r.id === row.id ? row : r);
			});
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "profiles"
		}, (payload) => {
			const p = payload.new;
			setProfiles((prev) => ({
				...prev,
				[p.id]: p
			}));
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "round_participants"
		}, (payload) => {
			if (payload.eventType === "DELETE") {
				const old = payload.old;
				setParticipants((prev) => prev.filter((p) => p.id !== old.id));
			} else {
				const row = payload.new;
				setParticipants((prev) => prev.some((p) => p.id === row.id) ? prev.map((p) => p.id === row.id ? row : p) : [...prev, row]);
			}
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		for (const r of rounds) if (r.status === "bidding" && r.ends_at && new Date(r.ends_at).getTime() <= now) supabase.rpc("settle_round", { _round_id: r.id }).then(({ error }) => {
			if (error) {}
		});
	}, [rounds, now]);
	const liveRounds = rounds.filter((r) => r.status !== "ended");
	const endedRounds = rounds.filter((r) => r.status === "ended").slice(0, 6);
	const startRound = async () => {
		if (!userId) return;
		setStarting(true);
		const { data, error } = await supabase.rpc("start_round", { _title: title.trim() });
		if (error) {
			toast.error(error.message);
			setStarting(false);
			return;
		}
		setTitle("");
		navigate({
			to: "/auction/$id",
			params: { id: data }
		});
	};
	const participantCount = (roundId) => participants.filter((p) => p.round_id === roundId).length;
	const leaderboard = (0, import_react.useMemo)(() => Object.values(profiles).sort((a, b) => b.balance - a.balance).slice(0, 8), [profiles]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_320px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "font-display text-3xl font-bold",
								children: "Auction Lobby"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Host a live auction, or join one in progress."
							})] })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-3 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: title,
								onChange: (e) => setTitle(e.target.value),
								placeholder: "Auction title (optional)",
								maxLength: 40,
								className: "flex-1 rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: startRound,
								disabled: starting,
								className: "btn-gold whitespace-nowrap",
								children: "🎩 Host a round →"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Hosting opens a private bidding room. You pick the item, friends join and bid."
						})
					]
				}),
				liveRounds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-10 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-5xl",
						children: "🪑"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-muted-foreground",
						children: [
							"No auctions running. Click ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Host a round" }),
							" to start one."
						]
					})]
				}),
				liveRounds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "🔴 Live auctions"
					}), liveRounds.map((r) => {
						const host = profiles[r.host_id];
						const item = r.item_id ? items[r.item_id] : null;
						const isHost = userId === r.host_id;
						const joined = participants.some((p) => p.round_id === r.id && p.user_id === userId);
						const secLeft = r.ends_at ? Math.max(0, Math.ceil((new Date(r.ends_at).getTime() - now) / 1e3)) : null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "panel flex items-center justify-between gap-4 p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex min-w-0 items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-3xl",
									children: item ? item.emoji : "❓"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "chip",
												children: [
													host?.avatar_emoji ?? "🎲",
													" ",
													host?.username ?? "…"
												]
											}), r.status === "bidding" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: `chip ${secLeft <= 5 ? "!bg-destructive !text-destructive-foreground !border-destructive" : ""}`,
												children: [
													"⏱ ",
													secLeft,
													"s"
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "chip",
												children: "Picking…"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 truncate font-display text-lg font-bold",
											children: r.title || (item ? item.name : "Mystery auction")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 text-xs text-muted-foreground",
											children: r.status === "bidding" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												"Current bid ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", {
													className: "text-foreground",
													children: [r.current_bid || r.starting_bid, " BM"]
												}),
												" · ",
												participantCount(r.id),
												" in the room"
											] }) : `${participantCount(r.id)} in the room`
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auction/$id",
								params: { id: r.id },
								className: "btn-primary shrink-0",
								children: isHost ? "Manage" : joined ? "Re-enter" : "Join →"
							})]
						}, r.id);
					})]
				}),
				endedRounds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-xl font-bold",
						children: "Recent results"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 divide-y divide-border/60",
						children: endedRounds.map((r) => {
							const item = r.item_id ? items[r.item_id] : null;
							const winner = r.winner_id ? profiles[r.winner_id] : null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between py-3 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xl",
										children: item?.emoji ?? "❓"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium",
										children: item?.name ?? "No item picked"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: winner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										"won by ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["@", winner.username] }),
										" for ",
										r.winning_bid,
										" BM"
									] }) : "no bids"
								})]
							}, r.id);
						})
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold",
					children: "🏆 Richest players"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-3 space-y-2",
					children: leaderboard.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "w-5 text-center text-muted-foreground",
									children: i + 1
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.avatar_emoji }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: [
										"@",
										p.username,
										p.id === userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-1 text-xs text-[color:var(--felt)]",
											children: "(you)"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: p.balance.toLocaleString()
						})]
					}, p.id))
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold text-foreground",
					children: "How it works"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-1.5 list-disc pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							"Everyone gets ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "1000 BET MONEY" }),
							" at signup."
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Host a round → open a private bidding room." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Friends join the room and bid live. 45s rounds, last 10s bids extend the clock." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Winner pays and gets the item. Resell on the Market." })
					]
				})]
			})]
		})]
	}) });
}
//#endregion
export { PlayPage as component };
