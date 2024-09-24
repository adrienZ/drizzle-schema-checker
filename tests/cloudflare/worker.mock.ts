/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import type { ExportedHandler } from "@cloudflare/workers-types/experimental";
type Env = Record<string, unknown>;

export default {
	// @ts-expect-error just a mock
	async fetch(request, env, ctx): Promise<Response> {
		console.log(env);
		return new Response("Hello World!");
	},
} satisfies ExportedHandler<Env>;
