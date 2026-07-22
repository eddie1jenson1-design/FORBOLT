import { n as __toESM } from "./_runtime.mjs";
import { t as supabase } from "./_ssr/client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "./_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate } from "./_libs/@tanstack/react-router+[...].mjs";
import { t as Route } from "./_id-a5cd7c5l.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as AppShell } from "./_ssr/AppShell-CZiMROu7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-DN5iRFjx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuctionRoom() {
	const { id } = Route.useParams();
	const navigate = useNavigate();
	const [userId, setUserId] = (0, import_react.useState)(null);
	const [round, setRound] = (0, import_react.useState)(null);
	const [items, setItems] = (0, import_react.useState)({});
	const [profiles, setProfiles] = (0, import_react.useState)({});
	const [participants, setParticipants] = (0, import_react.useState)([]);
	const [bids, setBids] = (0, import_react.useState)([]);
	const [now, setNow] = (0, import_react.useState)(Date.now());
	const [bidAmount, setBidAmount] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const settledRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
	}, []);
	(0, import_react.useEffect)(() => {
		const i = setInterval(() => setNow(Date.now()), 400);
		return () => clearInterval(i);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!id) return;
		(async () => {
			const [{ data: rd }, { data: its }, { data: ps }, { data: parts }, { data: b }] = await Promise.all([
				supabase.from("rounds").select("*").eq("id", id).maybeSingle(),
				supabase.from("items").select("*"),
				supabase.from("profiles").select("id, username, balance, avatar_emoji"),
				supabase.from("round_participants").select("*").eq("round_id", id),
				supabase.from("bids").select("*").eq("round_id", id).order("created_at", { ascending: false }).limit(20)
			]);
			if (rd) setRound(rd);
			if (its) setItems(Object.fromEntries(its.map((x) => [x.id, x])));
			if (ps) setProfiles(Object.fromEntries(ps.map((p) => [p.id, p])));
			if (parts) setParticipants(parts);
			if (b) setBids(b);
		})();
		const ch = supabase.channel(`room-${id}`).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "rounds",
			filter: `id=eq.${id}`
		}, (p) => {
			if (p.eventType === "DELETE") {
				navigate({ to: "/play" });
				return;
			}
			setRound(p.new);
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "round_participants",
			filter: `round_id=eq.${id}`
		}, (p) => {
			if (p.eventType === "DELETE") {
				const o = p.old;
				setParticipants((prev) => prev.filter((x) => x.id !== o.id));
			} else {
				const row = p.new;
				setParticipants((prev) => prev.some((x) => x.id === row.id) ? prev.map((x) => x.id === row.id ? row : x) : [...prev, row]);
			}
		}).on("postgres_changes", {
			event: "INSERT",
			schema: "public",
			table: "bids",
			filter: `round_id=eq.${id}`
		}, (p) => {
			const row = p.new;
			setBids((prev) => [row, ...prev].slice(0, 20));
		}).on("postgres_changes", {
			event: "*",
			schema: "public",
			table: "profiles"
		}, (p) => {
			const pr = p.new;
			setProfiles((prev) => ({
				...prev,
				[pr.id]: pr
			}));
		}).subscribe();
		return () => {
			supabase.removeChannel(ch);
		};
	}, [id, navigate]);
	(0, import_react.useEffect)(() => {
		if (!round) return;
		if (round.status === "bidding" && round.ends_at && new Date(round.ends_at).getTime() <= now && !settledRef.current) {
			settledRef.current = true;
			supabase.rpc("settle_round", { _round_id: round.id }).then(({ error }) => {
				if (error) toast.error("Settle failed: " + error.message);
				setTimeout(() => {
					settledRef.current = false;
				}, 3e3);
			});
		}
	}, [round, now]);
	(0, import_react.useEffect)(() => {
		if (!userId || !round) return;
		if (!participants.some((p) => p.user_id === userId) && round.status !== "ended") supabase.from("round_participants").insert({
			round_id: round.id,
			user_id: userId
		}).then(({ error }) => {
			if (error && !error.message.includes("duplicate")) {}
		});
	}, [
		userId,
		round,
		participants
	]);
	if (!round) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel p-10 text-center text-muted-foreground",
		children: "Loading auction…"
	}) });
	const isHost = userId === round.host_id;
	const host = profiles[round.host_id];
	const chosenItem = round.item_id ? items[round.item_id] : null;
	const secLeft = round.ends_at ? Math.max(0, Math.ceil((new Date(round.ends_at).getTime() - now) / 1e3)) : null;
	const topBidder = round.current_bidder_id ? profiles[round.current_bidder_id] : null;
	const myBalance = userId ? profiles[userId]?.balance ?? 0 : 0;
	const minNextBid = round.current_bid > 0 ? round.current_bid + 5 : round.starting_bid;
	const roomPlayers = participants.map((p) => profiles[p.user_id]).filter(Boolean);
	const iWon = round.winner_id === userId;
	const iLost = round.status === "ended" && round.winner_id && round.winner_id !== userId && bids.some((b) => b.bidder_id === userId);
	const pickItem = async (itemId) => {
		setBusy(true);
		const { error } = await supabase.rpc("pick_item", {
			_item_id: itemId,
			_round_id: round.id
		});
		if (error) toast.error(error.message);
		setBusy(false);
	};
	const placeBid = async () => {
		if (bidAmount === "" || bidAmount < minNextBid) {
			toast.error(`Min bid is ${minNextBid} BM`);
			return;
		}
		setBusy(true);
		const { error } = await supabase.rpc("place_bid", {
			_amount: Number(bidAmount),
			_round_id: round.id
		});
		if (error) toast.error(error.message);
		else {
			setBidAmount("");
			toast.success("Bid placed!");
		}
		setBusy(false);
	};
	const endRound = async () => {
		const { error } = await supabase.rpc("settle_round", { _round_id: round.id });
		if (error) toast.error(error.message);
	};
	const quickBids = [
		minNextBid,
		minNextBid + 10,
		minNextBid + 25,
		minNextBid + 50
	].filter((v, i, arr) => arr.indexOf(v) === i);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/play",
			className: "text-sm text-muted-foreground hover:underline",
			children: "← Back to lobby"
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_300px]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								host?.avatar_emoji ?? "🎲",
								" Hosted by @",
								host?.username ?? "…"
							] }),
							isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "chip",
								children: "you are host"
							}),
							round.title && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "chip",
								children: ["📅 ", round.title]
							})
						]
					}),
					round.status === "picking" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl font-bold",
								children: "Pick the item to auction"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Friends can join the room while you decide. Once you pick, bidding opens for 45 seconds."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 grid gap-3 sm:grid-cols-3",
								children: round.choice_item_ids.map((cid) => {
									const it = items[cid];
									if (!it) return null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										disabled: busy,
										onClick: () => pickItem(cid),
										className: "panel group p-5 text-left transition hover:-translate-y-1 hover:border-[color:var(--gold)] disabled:opacity-50",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-4xl",
												children: it.emoji
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 font-display text-lg font-bold",
												children: it.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 text-xs text-muted-foreground",
												children: it.description
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-3 font-semibold text-[color:var(--felt)]",
												children: "Pick this →"
											})
										]
									}, cid);
								})
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-5xl",
									children: "🎩"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "mt-2 font-display text-2xl font-bold",
									children: "Waiting for host to pick…"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm text-muted-foreground",
									children: [
										"@",
										host?.username,
										" is choosing the item. Get ready to bid!"
									]
								})
							]
						})
					}),
					round.status === "bidding" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-6xl",
										children: chosenItem?.emoji ?? "❓"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-2xl font-bold",
											children: chosenItem?.name ?? "Mystery item"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: chosenItem?.description
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `timer-chip ${secLeft <= 5 ? "timer-critical" : ""}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-2xl font-black",
											children: secLeft
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs",
											children: "sec"
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-2xl bg-secondary/60 p-5 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs uppercase tracking-wider text-muted-foreground",
										children: "Current top bid"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 font-display text-4xl font-black",
										children: [
											round.current_bid || round.starting_bid,
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-lg",
												children: "BM"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-sm text-muted-foreground",
										children: topBidder ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Leading: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [
											topBidder.avatar_emoji,
											" @",
											topBidder.username
										] })] }) : "No bids yet — be first!"
									})
								]
							}),
							!isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: ["Your balance: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [myBalance.toLocaleString(), " BM"] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-muted-foreground",
											children: ["Min next bid: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [minNextBid, " BM"] })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "number",
											value: bidAmount,
											onChange: (e) => setBidAmount(e.target.value === "" ? "" : Number(e.target.value)),
											placeholder: String(minNextBid),
											min: minNextBid,
											className: "flex-1 rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: placeBid,
											disabled: busy || myBalance < minNextBid,
											className: "btn-gold",
											children: busy ? "…" : "Place bid"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2 flex flex-wrap gap-2",
										children: quickBids.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => setBidAmount(v),
											disabled: myBalance < v,
											className: "chip hover:border-[color:var(--gold)] disabled:opacity-40",
											children: [
												"+",
												v - (round.current_bid || round.starting_bid),
												" → ",
												v
											]
										}, v))
									}),
									myBalance < minNextBid && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-xs text-destructive",
										children: "You don't have enough BET MONEY to bid."
									})
								]
							}),
							isHost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: endRound,
									className: "btn-ghost",
									children: "End bidding now"
								})
							})
						]
					}),
					round.status === "ended" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-5xl",
								children: iWon ? "🎉" : round.winner_id ? "🤝" : "🪑"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-2xl font-bold",
								children: round.winner_id ? iWon ? "You won it!" : "Auction over" : "No bids — round ended"
							}),
							round.winner_id && round.winning_bid != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-1 text-muted-foreground",
								children: [
									profiles[round.winner_id]?.avatar_emoji,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: ["@", profiles[round.winner_id]?.username] }),
									" won",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: chosenItem?.name }),
									" for ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("b", { children: [round.winning_bid, " BM"] })
								]
							}),
							iWon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-[color:var(--felt)]",
								children: "It's in your inventory. List it on the Market to flip it."
							}),
							iLost && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Better luck next round."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/inventory",
								className: "btn-primary mt-4 inline-block",
								children: "View inventory →"
							})
						]
					})
				]
			}), round.status !== "picking" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold",
					children: "📜 Bid history"
				}), bids.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "No bids yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-1.5",
					children: bids.map((b) => {
						const p = profiles[b.bidder_id];
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `flex items-center justify-between rounded-lg px-3 py-2 text-sm ${round.current_bidder_id === b.bidder_id && b.amount === round.current_bid ? "bg-[color:var(--gold)]/10" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
								p?.avatar_emoji ?? "🎲",
								" @",
								p?.username ?? "someone"
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-bold",
								children: [b.amount, " BM"]
							})]
						}, b.id);
					})
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
			className: "space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold",
					children: "👥 In the room"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-3 space-y-2",
					children: [roomPlayers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-sm text-muted-foreground",
						children: "Just the host so far."
					}), roomPlayers.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-lg",
									children: p.avatar_emoji
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-medium",
									children: ["@", p.username]
								}),
								p.id === round.host_id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "chip !py-0",
									children: "host"
								}),
								p.id === userId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-[color:var(--felt)]",
									children: "(you)"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: p.balance.toLocaleString()
						})]
					}, p.id))]
				})]
			}), round.status === "bidding" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel p-5 text-sm text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-lg font-bold text-foreground",
					children: "Bidding rules"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-2 space-y-1.5 list-disc pl-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "45-second rounds." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Bids in the last 10s extend the clock by 10s." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Minimum increment is 5 BM." }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Highest bid when the clock hits zero wins." })
					]
				})]
			})]
		})]
	})] });
}
//#endregion
export { AuctionRoom as component };
