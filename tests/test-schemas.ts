import {
	sqliteTable,
	text,
	integer,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const datesColumns = {
	created_at: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	update_at: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
};

export const usersSchema = sqliteTable("slip_users", {
	id: text("id").primaryKey().notNull(),
	password: text("password"),
	email: text("email").notNull().unique(),
	email_verified: integer("email_verified", { mode: "boolean" }).notNull().default(sql`0`),
	...datesColumns,
});

export const sessionsSchema = sqliteTable("slip_sessions", {
	id: text("id").primaryKey().notNull(),
	expires_at: integer("expires_at").notNull(),
	ip: text("ip"),
	ua: text("ua"),
	user_id: text("user_id")
		.references(() => usersSchema.id)
		.notNull(),
	...datesColumns,
});

// https://lucia-auth.com/guides/oauth/multiple-providers
export const oauthAccountsSchema = sqliteTable(
	"slip_oauth_accounts",
	{
		provider_id: text("provider_id").notNull(),
		provider_user_id: text("provider_user_id").notNull(),
		user_id: text("user_id")
			.references(() => usersSchema.id)
			.notNull(),
		...datesColumns,
	},
	(slipAuthOAuthAccounts) => ({
		pk: primaryKey(
			slipAuthOAuthAccounts.provider_id,
			slipAuthOAuthAccounts.provider_user_id,
		),
	}),
);
