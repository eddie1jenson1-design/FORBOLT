import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/play")({
  head: () => ({ meta: [{ title: "Auction Lobby — BET MONEY" }, { name: "description", content: "Live fake-money auctions with your friends." }] }),
  component: PlayPage,
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
type Participant = { id: string; round_id: string; user_id: string; joined_at: string };

function PlayPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [rounds, setRounds] = useState<Round[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [now, setNow] = useState(Date.now());
  const [starting, setStarting] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);
  useEffect(() => { const i = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(i); }, []);

  useEffect(() => {
    (async () => {
      const [{ data: it }, { data: rs }, { data: ps }, { data: parts }] = await Promise.all([
        supabase.from("items").select("*"),
        supabase.from("rounds").select("*").order("created_at", { ascending: false }).limit(30),
        supabase.from("profiles").select("id, username, balance, avatar_emoji"),
        supabase.from("round_participants").select("*"),
      ]);
      if (it) setItems(Object.fromEntries(it.map((x: Item) => [x.id, x])));
      if (rs) setRounds(rs as Round[]);
      if (ps) setProfiles(Object.fromEntries(ps.map((p: Profile) => [p.id, p])));
      if (parts) setParticipants(parts as Participant[]);
    })();

    const ch = supabase
      .channel("play-lobby")
      .on("postgres_changes", { event: "*", schema: "public", table: "rounds" }, (payload) => {
        setRounds((prev) => {
          const row = payload.new as Round;
          if (payload.eventType === "DELETE") return prev.filter((r) => r.id !== (payload.old as Round).id);
          const exists = prev.some((r) => r.id === row.id);
          if (!exists) return [row, ...prev].slice(0, 30);
          return prev.map((r) => (r.id === row.id ? row : r));
        });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, (payload) => {
        const p = payload.new as Profile;
        setProfiles((prev) => ({ ...prev, [p.id]: p }));
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "round_participants" }, (payload) => {
        if (payload.eventType === "DELETE") {
          const old = payload.old as Participant;
          setParticipants((prev) => prev.filter((p) => p.id !== old.id));
        } else {
          const row = payload.new as Participant;
          setParticipants((prev) => prev.some((p) => p.id === row.id) ? prev.map((p) => p.id === row.id ? row : p) : [...prev, row]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  useEffect(() => {
    for (const r of rounds) {
      if (r.status === "bidding" && r.ends_at && new Date(r.ends_at).getTime() <= now) {
        supabase.rpc("settle_round", { _round_id: r.id }).then(({ error }) => {
          if (error) { void error; }
        });
      }
    }
  }, [rounds, now]);

  const liveRounds = rounds.filter((r) => r.status !== "ended");
  const endedRounds = rounds.filter((r) => r.status === "ended").slice(0, 6);

  const startRound = async () => {
    if (!userId) return;
    setStarting(true);
    const { data, error } = await supabase.rpc("start_round", { _title: title.trim() });
    if (error) { toast.error(error.message); setStarting(false); return; }
    setTitle("");
    navigate({ to: "/auction/$id", params: { id: data as string } });
  };

  const participantCount = (roundId: string) => participants.filter((p) => p.round_id === roundId).length;

  const leaderboard = useMemo(
    () => Object.values(profiles).sort((a, b) => b.balance - a.balance).slice(0, 8),
    [profiles],
  );

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold">Auction Lobby</h1>
                <p className="text-sm text-muted-foreground">Host a live auction, or join one in progress.</p>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Auction title (optional)"
                maxLength={40}
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
              />
              <button onClick={startRound} disabled={starting} className="btn-gold whitespace-nowrap">
                🎩 Host a round →
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Hosting opens a private bidding room. You pick the item, friends join and bid.</p>
          </div>

          {liveRounds.length === 0 && (
            <div className="panel p-10 text-center">
              <div className="text-5xl">🪑</div>
              <p className="mt-3 text-muted-foreground">No auctions running. Click <b>Host a round</b> to start one.</p>
            </div>
          )}

          {liveRounds.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-bold">🔴 Live auctions</h2>
              {liveRounds.map((r) => {
                const host = profiles[r.host_id];
                const item = r.item_id ? items[r.item_id] : null;
                const isHost = userId === r.host_id;
                const joined = participants.some((p) => p.round_id === r.id && p.user_id === userId);
                const secLeft = r.ends_at ? Math.max(0, Math.ceil((new Date(r.ends_at).getTime() - now) / 1000)) : null;
                return (
                  <div key={r.id} className="panel flex items-center justify-between gap-4 p-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-secondary text-3xl">
                        {item ? item.emoji : "❓"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="chip">{host?.avatar_emoji ?? "🎲"} {host?.username ?? "…"}</span>
                          {r.status === "bidding" ? (
                            <span className={`chip ${secLeft! <= 5 ? "!bg-destructive !text-destructive-foreground !border-destructive" : ""}`}>⏱ {secLeft}s</span>
                          ) : (
                            <span className="chip">Picking…</span>
                          )}
                        </div>
                        <div className="mt-1 truncate font-display text-lg font-bold">
                          {r.title || (item ? item.name : "Mystery auction")}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {r.status === "bidding"
                            ? <>Current bid <b className="text-foreground">{r.current_bid || r.starting_bid} BM</b> · {participantCount(r.id)} in the room</>
                            : `${participantCount(r.id)} in the room`}
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/auction/$id"
                      params={{ id: r.id }}
                      className="btn-primary shrink-0"
                    >
                      {isHost ? "Manage" : joined ? "Re-enter" : "Join →"}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}

          {endedRounds.length > 0 && (
            <div className="panel p-6">
              <h2 className="font-display text-xl font-bold">Recent results</h2>
              <ul className="mt-3 divide-y divide-border/60">
                {endedRounds.map((r) => {
                  const item = r.item_id ? items[r.item_id] : null;
                  const winner = r.winner_id ? profiles[r.winner_id] : null;
                  return (
                    <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">{item?.emoji ?? "❓"}</span>
                        <span className="font-medium">{item?.name ?? "No item picked"}</span>
                      </span>
                      <span className="text-muted-foreground">
                        {winner ? <>won by <b>@{winner.username}</b> for {r.winning_bid} BM</> : "no bids"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5">
            <h3 className="font-display text-lg font-bold">🏆 Richest players</h3>
            <ol className="mt-3 space-y-2">
              {leaderboard.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-5 text-center text-muted-foreground">{i + 1}</span>
                    <span>{p.avatar_emoji}</span>
                    <span className="font-medium">@{p.username}{p.id === userId && <span className="ml-1 text-xs text-[color:var(--felt)]">(you)</span>}</span>
                  </span>
                  <span className="font-semibold">{p.balance.toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="panel p-5 text-sm text-muted-foreground">
            <h3 className="font-display text-lg font-bold text-foreground">How it works</h3>
            <ul className="mt-2 space-y-1.5 list-disc pl-4">
              <li>Everyone gets <b>1000 BET MONEY</b> at signup.</li>
              <li>Host a round → open a private bidding room.</li>
              <li>Friends join the room and bid live. 45s rounds, last 10s bids extend the clock.</li>
              <li>Winner pays and gets the item. Resell on the Market.</li>
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
