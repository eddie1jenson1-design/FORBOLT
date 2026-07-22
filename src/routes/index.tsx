import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BET MONEY — fake auctions with friends" },
      { name: "description", content: "Everyone starts with 1000 BET MONEY. Host live auctions, outbid your friends on absurd items, and resell your treasures." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
  }, []);
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎲</span>
          <span className="font-display text-xl font-bold">BET MONEY</span>
        </div>
        <div className="flex gap-2">
          {signedIn ? (
            <Link to="/play" className="btn-gold">Enter the lobby</Link>
          ) : (
            <>
              <Link to="/auth" className="btn-ghost">Sign in</Link>
              <Link to="/auth" search={{ mode: "signup" }} className="btn-gold">Create account</Link>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 pt-10 pb-24 md:pt-20 text-center">
        <span className="chip">100% fake money · 100% real bragging</span>
        <h1 className="mt-6 font-display text-5xl md:text-7xl font-black leading-[0.95]">
          Bid absurd things<br/>
          with your <span className="text-[color:var(--felt)]">friends</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Everyone starts with <b>1000 BET MONEY</b>. Host a live auction, pick an item, and watch your friends
          fight over a haunted toaster in a real bidding room. Win it, then flip it on the market.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {signedIn ? (
            <Link to="/play" className="btn-gold text-base">Enter the auction lobby →</Link>
          ) : (
            <Link to="/auth" search={{ mode: "signup" }} className="btn-gold text-base">Grab your 1000 BET MONEY →</Link>
          )}
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {[
            { emoji: "🎩", title: "Host an auction", body: "Open a bidding room. You get 3 mystery items — pick one and the war begins." },
            { emoji: "💸", title: "Live bidding room", body: "Join any active auction. 45-second rounds, last bids in the final 10s extend the clock." },
            { emoji: "🏷️", title: "Flip it", body: "List anything you own on the market. Turn 12 BET MONEY into 200." },
          ].map((c) => (
            <div key={c.title} className="panel p-6 text-left transition hover:-translate-y-1">
              <div className="text-3xl">{c.emoji}</div>
              <h3 className="mt-3 font-display text-xl font-bold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
