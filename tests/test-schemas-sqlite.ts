import {
	sqliteTable,
	text,
	integer,
	primaryKey,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

const datesColumns = {
	createdAt: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	updatedAt: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
};

export const usersSchema = sqliteTable("slip_users", {
	id: text("id").primaryKey().notNull(),
	password: text("password"),
	email: text("email").notNull().unique(),
	emailVerified: integer("email_verified", { mode: "boolean" })
		.notNull()
		.default(sql`FALSE`),
	...datesColumns,
});

export const sessionsSchema = sqliteTable("slip_sessions", {
	id: text("id").primaryKey().notNull(),
	expiresAt: integer("expires_at").notNull(),
	ip: text("ip"),
	ua: text("ua"),
	userId: text("user_id")
		.references(() => usersSchema.id)
		.notNull(),
	...datesColumns,
});

// https://lucia-auth.com/guides/oauth/multiple-providers
export const oauthAccountsSchema = sqliteTable(
	"slip_oauth_accounts",
	{
		providerId: text("provider_id").notNull(),
		providerUserId: text("provider_user_id").notNull(),
		user_id: text("user_id")
			.references(() => usersSchema.id)
			.notNull(),
		...datesColumns,
	},
	(slipAuthOAuthAccounts) => ({
		pk: primaryKey(
			slipAuthOAuthAccounts.providerId,
			slipAuthOAuthAccounts.providerUserId,
		),
	}),
);
