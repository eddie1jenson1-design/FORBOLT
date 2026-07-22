import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  validateSearch: z.object({ mode: z.enum(["signin", "signup"]).optional() }),
  head: () => ({ meta: [{ title: "Sign in — BET MONEY" }, { name: "description", content: "Sign in to play BET MONEY with your friends." }] }),
  component: AuthPage,
});

const AVATARS = ["🎲", "🦊", "🐸", "🦉", "🐙", "🦄", "🐯", "🦝", "🐲", "🐧", "🦖", "🦩", "🐺", "🦅", "🐢", "🦕"];

function usernameToEmail(username: string) {
  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return `${clean || "player"}@betmoney.game`;
}

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/play" });
    });
  }, [navigate]);

  useEffect(() => {
    if (mode === "signup") setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
  }, [mode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = username.trim();
    if (!clean) return toast.error("Pick a username");
    if (clean.length < 3) return toast.error("Username must be at least 3 characters");
    if (clean.length > 20) return toast.error("Username must be 20 characters or less");
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) return toast.error("Username: letters, numbers, and underscores only");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      const email = usernameToEmail(clean);
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: clean, avatar_emoji: avatar } },
        });
        if (error) {
          if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) {
            toast.error("That username is taken. Try another.");
          } else {
            throw error;
          }
        } else if (data.session) {
          toast.success(`Welcome, ${clean}! You start with 1000 BET MONEY.`);
          navigate({ to: "/play" });
        } else {
          toast.success("Account created! You start with 1000 BET MONEY.");
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) throw signInError;
          navigate({ to: "/play" });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes("invalid")) {
            toast.error("Wrong username or password.");
          } else {
            throw error;
          }
        } else {
          navigate({ to: "/play" });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something broke");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="panel w-full max-w-md p-8">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">← back</Link>
        <div className="mt-3 text-4xl">{mode === "signup" ? avatar : "🎲"}</div>
        <h1 className="mt-3 font-display text-3xl font-bold">
          {mode === "signup" ? "Join the table" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" ? "New players start with 1000 BET MONEY. Just pick a name — no email needed." : "Sign in with your username to keep bidding."}
        </p>

        {mode === "signup" && (
          <div className="mt-5">
            <label className="text-xs font-semibold">Your face</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  className={`grid h-10 w-10 place-items-center rounded-xl border text-xl transition ${
                    avatar === a
                      ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 scale-110"
                      : "border-border bg-secondary hover:border-[color:var(--gold)]/60"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-semibold">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="LuckyDave"
              maxLength={20}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">3–20 characters · letters, numbers, underscores</p>
          </div>
          <div>
            <label className="text-xs font-semibold">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full text-base">
            {loading ? "…" : mode === "signup" ? "Create account & claim 1000 BET MONEY" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="font-semibold text-[color:var(--felt)] hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </p>
      </div>
    </div>
  );
}
