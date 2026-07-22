import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/inventory")({
  head: () => ({ meta: [{ title: "My Stuff & Market — BET MONEY" }, { name: "description", content: "Your treasures and the resale market." }] }),
  component: InventoryPage,
});

type Item = { id: string; name: string; emoji: string; description: string };
type InvRow = { id: string; owner_id: string; item_id: string; acquired_price: number; listed_price: number | null; acquired_at: string };
type Profile = { id: string; username: string; balance: number };

function InventoryPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [inv, setInv] = useState<InvRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [priceInput, setPriceInput] = useState<Record<string, string>>({});

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null)); }, []);

  useEffect(() => {
    const load = async () => {
      const [{ data: it }, { data: ps }, { data: rows }] = await Promise.all([
        supabase.from("items").select("*"),
        supabase.from("profiles").select("id, username, balance"),
        supabase.from("inventory").select("*").order("acquired_at", { ascending: false }),
      ]);
      if (it) setItems(Object.fromEntries(it.map((x: Item) => [x.id, x])));
      if (ps) setProfiles(Object.fromEntries(ps.map((p: Profile) => [p.id, p])));
      if (rows) setInv(rows as InvRow[]);
    };
    load();
    const ch = supabase
      .channel("inv-room")
      .on("postgres_changes", { event: "*", schema: "public", table: "inventory" }, load)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (p) => {
        const pr = p.new as Profile;
        setProfiles((prev) => ({ ...prev, [pr.id]: pr }));
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const mine = inv.filter((r) => r.owner_id === userId);
  const market = inv.filter((r) => r.listed_price != null && r.owner_id !== userId);

  const list = async (row: InvRow) => {
    const p = parseInt(priceInput[row.id] ?? "");
    if (!p || p <= 0) return toast.error("Enter a valid price");
    const { error } = await supabase.from("inventory").update({ listed_price: p }).eq("id", row.id);
    if (error) toast.error(error.message); else toast.success(`Listed for ${p} BM`);
  };
  const unlist = async (row: InvRow) => {
    const { error } = await supabase.from("inventory").update({ listed_price: null }).eq("id", row.id);
    if (error) toast.error(error.message);
  };
  const buy = async (row: InvRow) => {
    const { error } = await supabase.rpc("buy_listed", { _inventory_id: row.id });
    if (error) toast.error(error.message); else toast.success("Bought! 🎉");
  };

  return (
    <AppShell>
      <div className="grid gap-8">
        <section>
          <h1 className="font-display text-3xl font-bold">My Stuff</h1>
          <p className="mt-1 text-sm text-muted-foreground">List anything you own on the market. Set your own price.</p>
          {mine.length === 0 ? (
            <div className="panel mt-4 p-8 text-center text-muted-foreground">You don't own anything yet. Win an auction!</div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((row) => {
                const it = items[row.item_id];
                if (!it) return null;
                const listed = row.listed_price != null;
                return (
                  <div key={row.id} className="panel p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{it.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-lg font-bold">{it.name}</div>
                        <div className="text-xs text-muted-foreground">Paid {row.acquired_price} BM</div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{it.description}</p>
                    {listed ? (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="money-chip">Listed at {row.listed_price} BM</span>
                        <button onClick={() => unlist(row)} className="btn-ghost">Unlist</button>
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="number" min={1}
                          value={priceInput[row.id] ?? ""}
                          onChange={(e) => setPriceInput((p) => ({ ...p, [row.id]: e.target.value }))}
                          placeholder="Price"
                          className="w-24 rounded-lg border border-input bg-card px-3 py-2 outline-none focus:border-[color:var(--gold)]"
                        />
                        <button onClick={() => list(row)} className="btn-primary">List for sale</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-3xl font-bold">🏷️ Market</h2>
          <p className="mt-1 text-sm text-muted-foreground">Buy directly from other players — no bidding, first click wins.</p>
          {market.length === 0 ? (
            <div className="panel mt-4 p-8 text-center text-muted-foreground">Nothing on the market right now.</div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {market.map((row) => {
                const it = items[row.item_id];
                const seller = profiles[row.owner_id];
                if (!it) return null;
                return (
                  <div key={row.id} className="panel p-5">
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{it.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-lg font-bold">{it.name}</div>
                        <div className="text-xs text-muted-foreground">Seller: @{seller?.username ?? "…"}</div>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{it.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="money-chip">💰 {row.listed_price} BM</span>
                      <button onClick={() => buy(row)} className="btn-gold">Buy now</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
