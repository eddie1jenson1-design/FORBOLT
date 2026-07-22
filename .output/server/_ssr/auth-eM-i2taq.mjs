import { n as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-BG3DRmYF.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Route } from "./auth-BL5M2F6I.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-eM-i2taq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AVATARS = [
	"🎲",
	"🦊",
	"🐸",
	"🦉",
	"🐙",
	"🦄",
	"🐯",
	"🦝",
	"🐲",
	"🐧",
	"🦖",
	"🦩",
	"🐺",
	"🦅",
	"🐢",
	"🦕"
];
function usernameToEmail(username) {
	return `${username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || "player"}@betmoney.game`;
}
function AuthPage() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)(search.mode ?? "signin");
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [avatar, setAvatar] = (0, import_react.useState)(AVATARS[0]);
	const [loading, setLoading] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) navigate({ to: "/play" });
		});
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		if (mode === "signup") setAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
	}, [mode]);
	const submit = async (e) => {
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
					options: { data: {
						username: clean,
						avatar_emoji: avatar
					} }
				});
				if (error) if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) toast.error("That username is taken. Try another.");
				else throw error;
				else if (data.session) {
					toast.success(`Welcome, ${clean}! You start with 1000 BET MONEY.`);
					navigate({ to: "/play" });
				} else {
					toast.success("Account created! You start with 1000 BET MONEY.");
					const { error: signInError } = await supabase.auth.signInWithPassword({
						email,
						password
					});
					if (signInError) throw signInError;
					navigate({ to: "/play" });
				}
			} else {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) if (error.message.toLowerCase().includes("invalid")) toast.error("Wrong username or password.");
				else throw error;
				else navigate({ to: "/play" });
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something broke");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center px-4 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel w-full max-w-md p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/",
					className: "text-sm text-muted-foreground hover:underline",
					children: "← back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 text-4xl",
					children: mode === "signup" ? avatar : "🎲"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-3xl font-bold",
					children: mode === "signup" ? "Join the table" : "Welcome back"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: mode === "signup" ? "New players start with 1000 BET MONEY. Just pick a name — no email needed." : "Sign in with your username to keep bidding."
				}),
				mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
						className: "text-xs font-semibold",
						children: "Your face"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: AVATARS.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setAvatar(a),
							className: `grid h-10 w-10 place-items-center rounded-xl border text-xl transition ${avatar === a ? "border-[color:var(--gold)] bg-[color:var(--gold)]/15 scale-110" : "border-border bg-secondary hover:border-[color:var(--gold)]/60"}`,
							children: a
						}, a))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: submit,
					className: "mt-5 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-semibold",
								children: "Username"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: username,
								onChange: (e) => setUsername(e.target.value),
								placeholder: "LuckyDave",
								maxLength: 20,
								autoCapitalize: "none",
								autoCorrect: "off",
								spellCheck: false,
								className: "mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "3–20 characters · letters, numbers, underscores"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "text-xs font-semibold",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "password",
							required: true,
							minLength: 6,
							value: password,
							onChange: (e) => setPassword(e.target.value),
							placeholder: "At least 6 characters",
							className: "mt-1 w-full rounded-lg border border-input bg-card px-3 py-2.5 outline-none transition focus:border-[color:var(--gold)]"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "btn-gold w-full text-base",
							children: loading ? "…" : mode === "signup" ? "Create account & claim 1000 BET MONEY" : "Sign in"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-5 text-center text-sm text-muted-foreground",
					children: [
						mode === "signup" ? "Already have an account?" : "New here?",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setMode(mode === "signup" ? "signin" : "signup"),
							className: "font-semibold text-[color:var(--felt)] hover:underline",
							children: mode === "signup" ? "Sign in" : "Create one"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { AuthPage as component };
