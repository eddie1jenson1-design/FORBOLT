import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/auction/$id")({
  head: () => ({ meta: [{ title: "Auction Room — BET MONEY" }] }),
  component: AuctionRoom,
});

type Item = { id: string; name: string; emoji: string; description: string };
type Round = {
  id: string; host_id: string; status: string;
  choice_item_ids: string[]; item_id: string | null;
  current_bid: number; current_bidder_id: string | null; starting_bid: number;
  ends_at: string | null; winner_id: string | null; winning_bid: number | null;
  title: string | null; created_at: string;
};
type Profile = { id: string; username: string; balance: number; avatar_emoji: string };
type Bid = { id: string; round_id: string; bidder_id: string; amount: number; created_at: string };
type Participant = { id: string; round_id: string; user_id: string; joined_at: string };

function AuctionRoom() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [now, setNow] = useState(Date.now());
  const [bidAmount, setBidAmount] = useState<number | "">("");
  const [busy, setBusy] = useState(false);
  const settledRef = useRef(false);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 400); return () => clearInterval(i); }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [{ data: rd }, { data: its }, { data: ps }, { data: parts }, { data: b }] = await Promise.all([
        supabase.from("rounds").select("*").eq("id", id).maybeSingle(),
        supabase.from("items").select("*"),
        supabase.from("profiles").select("id, username, balance, avatar_emoji"),
        supabase.from("round_participants").select("*").eq("round_id", id),
        supabase.from("bids").select("*").eq("round_id", id).order("created_at", { ascending: false }).limit(20),
      ]);
      if (rd) setRound(rd as Round);
      if (its) setItems(Object.fromEntries(its.map((x: Item) => [x.id, x])));
      if (ps) setProfiles(Object.fromEntries(ps.map((p: Profile) => [p.id, p])));
      if (parts) setParticipants(parts as Participant[]);
      if (b) setBids(b as Bid[]);
    })();

    const ch = supabase
      .channel(`room-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "rounds", filter: `id=eq.${id}` }, (p) => {
        if (p.eventType === "DELETE") { navigate({ to: "/play" }); return; }
        setRound(p.new as Round);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "round_participants", filter: `round_id=eq.${id}` }, (p) => {
        if (p.eventType === "DELETE") { const o = p.old as Participant; setParticipants((prev) => prev.filter((x) => x.id !== o.id)); }
        else { const row = p.new as Participant; setParticipants((prev) => prev.some((x) => x.id === row.id) ? prev.map((x) => x.id === row.id ? row : x) : [...prev, row]); }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `round_id=eq.${id}` }, (p) => {
        const row = p.new as Bid;
        setBids((prev) => [row, ...prev].slice(0, 20));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (p) => {
        const pr = p.new as Profile;
        setProfiles((prev) => ({ ...prev, [pr.id]: pr }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [id, navigate]);

  useEffect(() => {
    if (!round) return;
    if (round.status === "bidding" && round.ends_at && new Date(round.ends_at).getTime() <= now && !settledRef.current) {
      settledRef.current = true;
      supabase.rpc("settle_round", { _round_id: round.id }).then(({ error }) => {
        if (error) toast.error("Settle failed: " + error.message);
        setTimeout(() => { settledRef.current = false; }, 3000);
      });
    }
  }, [round, now]);

  // Auto-join as participant
  useEffect(() => {
    if (!userId || !round) return;
    if (!participants.some((p) => p.user_id === userId) && round.status !== "ended") {
      supabase.from("round_participants").insert({ round_id: round.id, user_id: userId }).then(({ error }) => {
        if (error && !error.message.includes("duplicate")) { void error; }
      });
    }
  }, [userId, round, participants]);

  if (!round) {
    return (
      <AppShell>
        <div className="panel p-10 text-center text-muted-foreground">Loading auction…</div>
      </AppShell>
    );
  }

  const isHost = userId === round.host_id;
  const host = profiles[round.host_id];
  const chosenItem = round.item_id ? items[round.item_id] : null;
  const secLeft = round.ends_at ? Math.max(0, Math.ceil((new Date(round.ends_at).getTime() - now) / 1000)) : null;
  const topBidder = round.current_bidder_id ? profiles[round.current_bidder_id] : null;
  const myBalance = userId ? profiles[userId]?.balance ?? 0 : 0;
  const minNextBid = round.current_bid > 0 ? round.current_bid + 5 : round.starting_bid;
  const roomPlayers = participants.map((p) => profiles[p.user_id]).filter(Boolean);
  const iWon = round.winner_id === userId;
  const iLost = round.status === "ended" && round.winner_id && round.winner_id !== userId && bids.some((b) => b.bidder_id === userId);

  const pickItem = async (itemId: string) => {
    setBusy(true);
    const { error } = await supabase.rpc("pick_item", { _item_id: itemId, _round_id: round.id });
    if (error) toast.error(error.message);
    setBusy(false);
  };

  const placeBid = async () => {
    if (bidAmount === "" || bidAmount < minNextBid) { toast.error(`Min bid is ${minNextBid} BM`); return; }
    setBusy(true);
    const { error } = await supabase.rpc("place_bid", { _amount: Number(bidAmount), _round_id: round.id });
    if (error) toast.error(error.message);
    else { setBidAmount(""); toast.success("Bid placed!"); }
    setBusy(false);
  };

  const endRound = async () => {
    const { error } = await supabase.rpc("settle_round", { _round_id: round.id });
    if (error) toast.error(error.message);
  };

  const quickBids = [minNextBid, minNextBid + 10, minNextBid + 25, minNextBid + 50].filter((v, i, arr) => arr.indexOf(v) === i);

  return (
    <AppShell>
      <div className="mb-4">
        <Link to="/play" className="text-sm text-muted-foreground hover:underline">← Back to lobby</Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <div className="panel p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{host?.avatar_emoji ?? "🎲"} Hosted by @{host?.username ?? "…"}</span>
              {isHost && <span className="chip">you are host</span>}
              {round.title && <span className="chip">📅 {round.title}</span>}
            </div>

            {round.status === "picking" && (
              <div className="mt-4">
                {isHost ? (
                  <>
                    <h2 className="font-display text-2xl font-bold">Pick the item to auction</h2>
                    <p className="text-sm text-muted-foreground">Friends can join the room while you decide. Once you pick, bidding opens for 45 seconds.</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {round.choice_item_ids.map((cid) => {
                        const it = items[cid];
                        if (!it) return null;
                        return (
                          <button key={cid} disabled={busy} onClick={() => pickItem(cid)}
                            className="panel group p-5 text-left transition hover:-translate-y-1 hover:border-[color:var(--gold)] disabled:opacity-50">
                            <div className="text-4xl">{it.emoji}</div>
                            <div className="mt-2 font-display text-lg font-bold">{it.name}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{it.description}</div>
                            <div className="mt-3 font-semibold text-[color:var(--felt)]">Pick this →</div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="mt-4 text-center">
                    <div className="text-5xl">🎩</div>
                    <h2 className="mt-2 font-display text-2xl font-bold">Waiting for host to pick…</h2>
                    <p className="text-sm text-muted-foreground">@{host?.username} is choosing the item. Get ready to bid!</p>
                  </div>
                )}
              </div>
            )}

            {round.status === "bidding" && (
              <div className="mt-4">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">{chosenItem?.emoji ?? "❓"}</div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl font-bold">{chosenItem?.name ?? "Mystery item"}</h2>
                    <p className="text-sm text-muted-foreground">{chosenItem?.description}</p>
                  </div>
                  <div className={`timer-chip ${secLeft! <= 5 ? "timer-critical" : ""}`}>
                    <span className="text-2xl font-black">{secLeft}</span>
                    <span className="text-xs">sec</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-secondary/60 p-5 text-center">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Current top bid</div>
                  <div className="mt-1 font-display text-4xl font-black">{round.current_bid || round.starting_bid} <span className="text-lg">BM</span></div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {topBidder ? <>Leading: <b>{topBidder.avatar_emoji} @{topBidder.username}</b></> : "No bids yet — be first!"}
                  </div>
                </div>

                {!isHost && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your balance: <b>{myBalance.toLocaleString()} BM</b></span>
                      <span className="text-muted-foreground">Min next bid: <b>{minNextBid} BM</b></span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value === "" ? "" : Number(e.target.value))}
                        placeholder={String(minNextBid)}
                        min={minNextBid}
                        className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
                      />
                      <button onClick={placeBid} disabled={busy || myBalance < minNextBid} className="btn-gold">
                        {busy ? "…" : "Place bid"}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickBids.map((v) => (
                        <button key={v} onClick={() => setBidAmount(v)} disabled={myBalance < v}
                          className="chip hover:border-[color:var(--gold)] disabled:opacity-40">+{v - (round.current_bid || round.starting_bid)} → {v}</button>
                      ))}
                    </div>
                    {myBalance < minNextBid && <p className="mt-2 text-xs text-destructive">You don't have enough BET MONEY to bid.</p>}
                  </div>
                )}

                {isHost && (
                  <div className="mt-4 flex justify-center">
                    <button onClick={endRound} className="btn-ghost">End bidding now</button>
                  </div>
                )}
              </div>
            )}

            {round.status === "ended" && (
              <div className="mt-4 text-center">
                <div className="text-5xl">{iWon ? "🎉" : round.winner_id ? "🤝" : "🪑"}</div>
                <h2 className="mt-2 font-display text-2xl font-bold">
                  {round.winner_id ? (iWon ? "You won it!" : "Auction over") : "No bids — round ended"}
                </h2>
                {round.winner_id && round.winning_bid != null && (
                  <p className="mt-1 text-muted-foreground">
                    {profiles[round.winner_id]?.avatar_emoji} <b>@{profiles[round.winner_id]?.username}</b> won{" "}
                    <b>{chosenItem?.name}</b> for <b>{round.winning_bid} BM</b>
                  </p>
                )}
                {iWon && <p className="mt-2 text-sm text-[color:var(--felt)]">It's in your inventory. List it on the Market to flip it.</p>}
                {iLost && <p className="mt-2 text-sm text-muted-foreground">Better luck next round.</p>}
                <Link to="/inventory" className="btn-primary mt-4 inline-block">View inventory →</Link>
              </div>
            )}
          </div>

          {round.status !== "picking" && (
            <div className="panel p-5">
              <h3 className="font-display text-lg font-bold">📜 Bid history</h3>
              {bids.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">No bids yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {bids.map((b) => {
                    const p = profiles[b.bidder_id];
                    const isTop = round.current_bidder_id === b.bidder_id && b.amount === round.current_bid;
                    return (
                      <li key={b.id} className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${isTop ? "bg-[color:var(--gold)]/10" : ""}`}>
                        <span>{p?.avatar_emoji ?? "🎲"} @{p?.username ?? "someone"}</span>
                        <span className="font-bold">{b.amount} BM</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display text-lg font-bold">👥 In the room</h3>
            <ul className="mt-3 space-y-2">
              {roomPlayers.length === 0 && <li className="text-sm text-muted-foreground">Just the host so far.</li>}
              {roomPlayers.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{p.avatar_emoji}</span>
                    <span className="font-medium">@{p.username}</span>
                    {p.id === round.host_id && <span className="chip !py-0">host</span>}
                    {p.id === userId && <span className="text-xs text-[color:var(--felt)]">(you)</span>}
                  </span>
                  <span className="text-muted-foreground">{p.balance.toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>

          {round.status === "bidding" && (
            <div className="panel p-5 text-sm text-muted-foreground">
              <h3 className="font-display text-lg font-bold text-foreground">Bidding rules</h3>
              <ul className="mt-2 space-y-1.5 list-disc pl-4">
                <li>45-second rounds.</li>
                <li>Bids in the last 10s extend the clock by 10s.</li>
                <li>Minimum increment is 5 BM.</li>
                <li>Highest bid when the clock hits zero wins.</li>
              </ul>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
