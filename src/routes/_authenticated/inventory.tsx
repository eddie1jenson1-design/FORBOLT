import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "My Stuff & Market — BET MONEY" }] }),
  component: InventoryPage,
});

type Item = { id: string; name: string; emoji: string; description: string };
type Inventory = { id: string; item_id: string; owner_id: string; acquired_at: string; acquired_price: number; listed_price: number | null };
type Profile = { id: string; username: string; avatar_emoji: string };

function InventoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [mine, setMine] = useState<Inventory[]>([]);
  const [market, setMarket] = useState<(Inventory & { owner_username: string; owner_avatar: string })[]>([]);
  const [tab, setTab] = useState<"mine" | "market">("mine");
  const [editing, setEditing] = useState<string | null>(null);
  const [listPrice, setListPrice] = useState<number | "">("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  const load = async () => {
    const [{ data: its }, { data: ps }, { data: inv }] = await Promise.all([
      supabase.from("items").select("*"),
      supabase.from("profiles").select("id, username, avatar_emoji"),
      supabase.from("inventory").select("*").order("acquired_at", { ascending: false }),
    ]);
    if (its) setItems(Object.fromEntries(its.map((x: Item) => [x.id, x])));
    if (ps) setProfiles(Object.fromEntries(ps.map((p: Profile) => [p.id, p])));
    if (inv) {
      const all = inv as Inventory[];
      setMine(all.filter((i) => i.owner_id === userId));
      setMarket(
        all.filter((i) => i.listed_price != null && i.owner_id !== userId)
          .map((i) => ({ ...i, owner_username: profiles[i.owner_id]?.username ?? "someone", owner_avatar: profiles[i.owner_id]?.avatar_emoji ?? "🎲" })),
      );
    }
  };

  useEffect(() => { if (userId) load(); }, [userId]);

  useEffect(() => {
    const ch = supabase
      .channel("inv-market")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [userId]);

  const listItem = async (invId: string) => {
    if (listPrice === "" || listPrice < 1) { toast.error("Enter a price ≥ 1"); return; }
    setBusy(true);
    const { error } = await supabase.from("inventory").update({ listed_price: Number(listPrice) }).eq("id", invId);
    if (error) toast.error(error.message);
    else { toast.success("Listed on the market!"); setEditing(null); setListPrice(""); }
    setBusy(false);
  };

  const unlist = async (invId: string) => {
    const { error } = await supabase.from("inventory").update({ listed_price: null }).eq("id", invId);
    if (error) toast.error(error.message);
    else toast.success("Removed from market");
  };

  const buy = async (invId: string) => {
    setBusy(true);
    const { error } = await supabase.rpc("buy_listed", { _inventory_id: invId });
    if (error) toast.error(error.message);
    else toast.success("Purchased! It's in your inventory.");
    setBusy(false);
  };

  return (
    <AppShell>
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button onClick={() => setTab("mine")} className={tab === "mine" ? "btn-gold" : "btn-ghost"}>🎒 My Stuff</button>
        <button onClick={() => setTab("market")} className={tab === "market" ? "btn-gold" : "btn-ghost"}>🏷️ Market</button>
      </div>

      {tab === "mine" && (
        <div className="mt-6">
          {mine.length === 0 ? (
            <div className="panel p-10 text-center">
              <div className="text-5xl">📭</div>
              <p className="mt-3 text-muted-foreground">You don't own anything yet. Win an auction or buy from the Market.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((inv) => {
                const item = items[inv.item_id];
                return (
                  <div key={inv.id} className="panel p-5">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{item?.emoji ?? "❓"}</div>
                      {inv.listed_price != null && <span className="chip !bg-[color:var(--felt)] !text-white">listed {inv.listed_price} BM</span>}
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">{item?.name ?? "Unknown"}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item?.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Acquired for {inv.acquired_price} BM</p>

                    {editing === inv.id ? (
                      <div className="mt-3 flex gap-2">
                        <input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value === "" ? "" : Number(e.target.value))} placeholder="Price" min={1}
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 outline-none focus:border-[color:var(--gold)]" />
                        <button onClick={() => listItem(inv.id)} disabled={busy} className="btn-gold">List</button>
                        <button onClick={() => { setEditing(null); setListPrice(""); }} className="btn-ghost">Cancel</button>
                      </div>
                    ) : inv.listed_price != null ? (
                      <button onClick={() => unlist(inv.id)} className="btn-ghost mt-3 w-full">Remove from market</button>
                    ) : (
                      <button onClick={() => { setEditing(inv.id); setListPrice(""); }} className="btn-primary mt-3 w-full">List for sale →</button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "market" && (
        <div className="mt-6">
          {market.length === 0 ? (
            <div className="panel p-10 text-center">
              <div className="text-5xl">🏪</div>
              <p className="mt-3 text-muted-foreground">Nothing for sale right now. Win an auction and list it!</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {market.map((inv) => {
                const item = items[inv.item_id];
                return (
                  <div key={inv.id} className="panel p-5">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{item?.emoji ?? "❓"}</div>
                      <span className="chip">{inv.owner_avatar} @{inv.owner_username}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-bold">{item?.name ?? "Unknown"}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item?.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-display text-2xl font-black">{inv.listed_price} <span className="text-sm">BM</span></span>
                      <button onClick={() => buy(inv.id)} disabled={busy} className="btn-gold">Buy →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
