import { describe, it, expect, beforeEach } from "vitest";
import pglite from "db0/connectors/pglite";
import { createDatabase } from "db0";
import { createChecker } from "../src/index";
import {
	oauthAccountsSchema,
	sessionsSchema,
	usersSchema,
} from "./test-schemas-sqlite";

function testFunction() {
	return createChecker(db, "pglite");
}

const db = createDatabase(
	pglite(),
);

beforeEach(async () => {
	await db.sql`DROP TABLE IF EXISTS slip_users`;
	await db.sql`DROP TABLE IF EXISTS slip_sessions`;
	await db.sql`DROP TABLE IF EXISTS slip_oauth_accounts`;
});

describe("sqlite connector", () => {
	describe("users table", () => {
		describe("id field", () => {
			it("should throw an error when users table does not exist in database", async () => {
				await expect(
					testFunction().checkTableWithSchema("slip_users", usersSchema),
				).rejects.toThrowError("slip_users table for SLIP does not exist");
			});
		});
	});
});
