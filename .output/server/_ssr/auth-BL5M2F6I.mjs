import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as objectType, t as enumType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BL5M2F6I.js
var $$splitComponentImporter = () => import("./auth-eM-i2taq.mjs");
var Route = createFileRoute("/auth")({
	validateSearch: objectType({ mode: enumType(["signin", "signup"]).optional() }),
	head: () => ({ meta: [{ title: "Sign in — BET MONEY" }, {
		name: "description",
		content: "Sign in to play BET MONEY with your friends."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
