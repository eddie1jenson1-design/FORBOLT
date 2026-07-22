import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<{ username: string; balance: number; avatar_emoji: string } | null>(null);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("username, balance, avatar_emoji")
        .eq("id", u.user.id)
        .maybeSingle();
      if (mounted && data) setProfile(data);
    };
    load();
    const channel = supabase
      .channel("profile-balance")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => load())
      .subscribe();
    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/play" className="flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            <span className="font-display text-lg font-bold">BET MONEY</span>
          </Link>
          <nav className="hidden gap-1 md:flex">
            <Link to="/play" className={`btn-ghost ${path === "/play" ? "bg-secondary" : ""}`}>Auction Lobby</Link>
            <Link to="/inventory" className={`btn-ghost ${path === "/inventory" ? "bg-secondary" : ""}`}>My Stuff & Market</Link>
          </nav>
          <div className="flex items-center gap-3">
            {profile && (
              <>
                <span className="hidden items-center gap-1.5 text-sm font-semibold md:inline-flex">
                  <span className="text-lg">{profile.avatar_emoji}</span>
                  <span>@{profile.username}</span>
                </span>
                <span className="money-chip">💰 {profile.balance.toLocaleString()} BM</span>
              </>
            )}
            <button onClick={signOut} className="btn-ghost">Sign out</button>
          </div>
        </div>
        <nav className="flex gap-1 border-t border-border/60 px-4 py-2 md:hidden">
          <Link to="/play" className={`btn-ghost flex-1 ${path === "/play" ? "bg-secondary" : ""}`}>Lobby</Link>
          <Link to="/inventory" className={`btn-ghost flex-1 ${path === "/inventory" ? "bg-secondary" : ""}`}>Stuff & Market</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-10">{children}</main>
    </div>
  );
}
