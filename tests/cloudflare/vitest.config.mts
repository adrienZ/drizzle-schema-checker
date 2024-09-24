import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
	test: {
		include: ["./d1-cloudflare-test.ts"],
		poolOptions: {
			workers: {
				isolatedStorage: true,
				wrangler: { configPath: "./wrangler.toml" },
			},
		},
	},
});
