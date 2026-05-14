import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			{
				test: {
					name: "drizzle-schema-checker",
					include: ["tests/**/*.test.ts"],
				},
			},
			{
				extends: "./tests/cloudflare/vitest.config.mts",
				test: {
					name: "cloudflare",
				},
			},
		],
	},
});
