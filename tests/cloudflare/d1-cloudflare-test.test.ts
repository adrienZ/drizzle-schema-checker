import { describe, it, expect, beforeEach } from "vitest";
import cloudflareD1 from "db0/connectors/cloudflare-d1";
import { createDatabase } from "db0";
import { createChecker } from "../../src/index";
import {
	oauthAccountsSchema,
	sessionsSchema,
	usersSchema,
} from "../test-schemas";
import { env as cloudflareEnv } from "cloudflare:test";

if (!globalThis.__env__) {
	globalThis.__env__ = {};
}

// Dynamically set the DB binding to globalThis.__env__
if (!globalThis.__env__.DB) {
	globalThis.__env__.DB = cloudflareEnv.DB; // env.DB is provided by Cloudflare Workers environment
}

function testFunction() {
	return createChecker(db, "cloudflare-d1");
}

const db = createDatabase(
	cloudflareD1({
		bindingName: "DB",
	}),
);

beforeEach(async () => {
	await db.sql`DROP TABLE IF EXISTS slip_sessions`;
	await db.sql`DROP TABLE IF EXISTS slip_oauth_accounts`;
	await db.sql`DROP TABLE IF EXISTS slip_users`;
});


describe("D1 connector", () => {
	describe("users table", () => {
		describe("id field", () => {
			it("should throw an error when users table does not exist in database", async () => {
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError("slip_users table for SLIP does not exist");
			});

			it("should throw an error when users table does not have an id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("notid" TEXT PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "id"',
				);
			});

			it("should throw an error when users table does not have an id field as primary key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "id" as primary key',
				);
			});

			it("should throw an error when users table does not have an id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" INTEGER PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "id" with type "TEXT"',
				);
			});

			it("should throw an error when users table does not have a not nullable id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT PRIMARY KEY, "email" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "id" not nullable',
				);
			});
		});

		describe("password field", () => {
			it("should throw an error when users table does not have a password field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "password"',
				);
			});

			it("should throw an error when users table does not have an email field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "password" with type "TEXT"',
				);
			});
		});

		describe("email field", () => {
			it("should throw an error when users table does not have an email field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "email"',
				);
			});

			it("should throw an error when users table does not have an email field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "email" with type "TEXT"',
				);
			});

			it("should throw an error when users table does not have an not nullable email field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "email" not nullable',
				);
			});

			it("should throw an error when users table does not have a unique email field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT NOT NULL)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "email" unique',
				);
			});
		});

		describe("email_verified field", () => {
			it("should throw an error when users table does not have an email_verified field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT NOT NULL UNIQUE)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "email_verified"',
				);
			});

			it("should throw an error when users table does not have an email_verified field with type of boolean", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT NOT NULL UNIQUE, "email_verified" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "email_verified" with type "BOOLEAN"',
				);
			});

			it("should throw an error when users table does not have an not nullable email_verified field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "email_verified" not nullable',
				);
			});

			it("should throw an error when users table does not have a default value of false at email_verified field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "password" TEXT, "email" TEXT NOT NULL UNIQUE, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "email_verified" BOOLEAN NOT NULL)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "email_verified" with default value of FALSE',
				);
			});
		});

		describe("created_at field", () => {
			it("should throw an error when users table does not have an created_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "created_at"',
				);
			});

			it("should throw an error when users table does not have an created_at field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "created_at" with type "TIMESTAMP"',
				);
			});

			it("should throw an error when users table does not have an not nullable created_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "created_at" not nullable',
				);
			});

			it("should throw an error when users table does not have a default value of CURRENT_TIMESTAMP at created_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP NOT NULL)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "created_at" with default value of CURRENT_TIMESTAMP',
				);
			});
		});

		describe("updated_at field", () => {
			it("should throw an error when users table does not have an updated_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "updated_at"',
				);
			});

			it("should throw an error when users table does not have an updated_at field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "updated_at" with type "TIMESTAMP"',
				);
			});

			it("should throw an error when users table does not have an not nullable updated_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column "updated_at" not nullable',
				);
			});

			it("should throw an error when users table does not have a default value of CURRENT_TIMESTAMP at updated_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "email_verified" BOOLEAN NOT NULL DEFAULT FALSE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`;
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError(
					'slip_users table must contain a column with name "updated_at" with default value of CURRENT_TIMESTAMP',
				);
			});
		});
	});

	describe("sessions table", () => {
		const validUsersTableSetup = () =>
			db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`;

		beforeEach(async () => {
			await validUsersTableSetup();
		});

		describe("id field", () => {
			it("should throw an error when sessions table does not exist in database", async () => {
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError("slip_sessions table for SLIP does not exist");
			});

			it("should throw an error when sessions table does not have an id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("notid" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column with name "id"',
				);
			});

			it("should throw an error when sessions table does not have an id field as primary key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "id" as primary key',
				);
			});

			it("should throw an error when sessions table does not have an id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" INTEGER PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "id" with type "TEXT"',
				);
			});

			it("should throw an error when sessions table does not have a not nullable id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "id" not nullable',
				);
			});
		});

		describe("expires_at field", () => {
			it("should throw an error when sessions table does not have an expires_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column with name "expires_at"',
				);
			});

			it("should throw an error when sessions table does not have an expires_at field with type of number", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" DATE)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "expires_at" with type "INTEGER"',
				);
			});

			it("should throw an error when sessions table does not have an not nullable expires_at field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "expires_at" not nullable',
				);
			});
		});

		describe("ip field", () => {
			it("should throw an error when sessions table does not have an ip field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column with name "ip"',
				);
			});

			it("should throw an error when sessions table does not have an ip field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "ip" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "ip" with type "TEXT"',
				);
			});
		});

		describe("ua field", () => {
			it("should throw an error when sessions table does not have an ua field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "ip" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column with name "ua"',
				);
			});

			it("should throw an error when sessions table does not have an ua field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "ip" TEXT, "ua" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "ua" with type "TEXT"',
				);
			});
		});

		describe("user_id field", () => {
			it("should throw an error when sessions table does not have a user_id foreign key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ip" TEXT, "ua" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table should have a foreign key "user_id"',
				);
			});

			it("should throw an error when sessions table does not have an user_id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "ip" TEXT, "ua" TEXT, "user_id" BLOB)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "user_id" with type "TEXT"',
				);
			});

			it("should throw an error when sessions table does not have an not nullable user_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "ip" TEXT, "ua" TEXT, "user_id" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table must contain a column "user_id" not nullable',
				);
			});

			it("should throw an error when sessions table does not have a user_id foreign key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ip" TEXT, "ua" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'slip_sessions table should have a foreign key "user_id"',
				);
			});

			it("should throw an error when sessions table does not have a user_id foreign key to user table", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS othertable ("id" TEXT)`;
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ip" TEXT, "ua" TEXT, FOREIGN KEY (user_id) REFERENCES othertable(id))`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'foreign key "user_id" in slip_sessions table should target "id" column from the "slip_users" table',
				);
			});

			it('should throw an error when sessions table does not have a user_id foreign key to user table "id" column', async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ip" TEXT, "ua" TEXT, FOREIGN KEY (user_id) REFERENCES slip_users(email))`;
				await expect(
					testFunction().checkTableWithSchema("slip_sessions", sessionsSchema),
				).rejects.toThrowError(
					'foreign key "user_id" in slip_sessions table should target "id" column from the "slip_users" table',
				);
			});
		});
	});

	describe("slip_oauth_accounts table", () => {
		const validUsersTableSetup = () =>
			db.sql`CREATE TABLE IF NOT EXISTS slip_users ("id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL UNIQUE, "password" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`;
		const validSessionsTableSetup = () =>
			db.sql`CREATE TABLE IF NOT EXISTS slip_sessions ("id" TEXT NOT NULL PRIMARY KEY, "expires_at" INTEGER NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "ip" TEXT, "ua" TEXT, FOREIGN KEY (user_id) REFERENCES slip_users(id))`;

		beforeEach(async () => {
			await validUsersTableSetup();
			await validSessionsTableSetup();
		});

		describe("provider_id field", () => {
			it("should throw an error when oauth table does not exist in database", async () => {
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					"slip_oauth_accounts table for SLIP does not exist",
				);
			});

			it("should throw an error when oauth table does not have an provider_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("notid" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column with name "provider_id"',
				);
			});

			it("should throw an error when oauth table does not have an provider_id field as primary key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_id" as primary key',
				);
			});

			it("should throw an error when oauth table does not have an provider_id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" INTEGER PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_id" with type "TEXT"',
				);
			});

			it("should throw an error when oauth table does not have a not nullable provider_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_id" not nullable',
				);
			});
		});

		describe("provider_user_id field", () => {
			it("should throw an error when oauth table does not have an provider_user_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL PRIMARY KEY)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column with name "provider_user_id"',
				);
			});

			it("should throw an error when oauth table does not have an provider_user_id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL PRIMARY KEY, "provider_user_id" INTEGER)`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_user_id" with type "TEXT"',
				);
			});

			it("should throw an error when oauth table does not have an provider_user_id field as primary key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT, PRIMARY KEY (provider_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_user_id" as primary key',
				);
			});

			it("should throw an error when oauth table does not have a not nullable provider_user_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT, PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "provider_user_id" not nullable',
				);
			});
		});

		describe("user_id field", () => {
			it("should throw an error when slip_oauth_accounts table does not have a user_id foreign key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table should have a foreign key "user_id"',
				);
			});

			it("should throw an error when slip_oauth_accounts table does not have an user_id field with type of text", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" BLOB, PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "user_id" with type "TEXT"',
				);
			});

			it("should throw an error when slip_oauth_accounts table does not have an not nullable user_id field", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" TEXT, PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table must contain a column "user_id" not nullable',
				);
			});

			it("should throw an error when slip_oauth_accounts table does not have a user_id foreign key", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'slip_oauth_accounts table should have a foreign key "user_id"',
				);
			});

			it("should throw an error when slip_oauth_accounts table does not have a user_id foreign key to user table", async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS othertable ("id" TEXT)`;
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES othertable(id), PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'foreign key "user_id" in slip_oauth_accounts table should target "id" column from the "slip_users" table',
				);
			});

			it('should throw an error when slip_oauth_accounts table does not have a user_id foreign key to user table "id" column', async () => {
				await db.sql`CREATE TABLE IF NOT EXISTS slip_oauth_accounts ("provider_id" TEXT NOT NULL, "provider_user_id" TEXT NOT NULL, "user_id" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES slip_users(email), PRIMARY KEY (provider_id, provider_user_id))`;
				await expect(
					testFunction().checkTableWithSchema(
						"slip_oauth_accounts",
						oauthAccountsSchema,
					),
				).rejects.toThrowError(
					'foreign key "user_id" in slip_oauth_accounts table should target "id" column from the "slip_users" table',
				);
			});
		});
	});
});
