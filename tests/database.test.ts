import { describe, it, expect } from "vitest";
import sqlite from "db0/connectors/better-sqlite3";
import { createDatabase } from "db0";
import { checkDatabaseValidity, createChecker } from "../src/index";

describe("checkDatabaseValidity", () => {
	it("should throw an error when no arguments are provided", () => {
		// @ts-expect-error testing no db
		expect(() => checkDatabaseValidity()).toThrow(
			"No database to check, please provide one",
		);
	});

	it("should throw an error when an invalid database is provided", () => {
		const invalidDatabase = {};
		expect(() => checkDatabaseValidity(invalidDatabase)).toThrowError(
			"The provided database is not a valid db0 database, see https://github.com/unjs/db0",
		);
	});
});

describe("checkAndCreateDb", () => {
	it("should throw an error when unsupported connector are provided", async () => {
		const db = createDatabase(
			sqlite({
				name: "database.test",
			}),
		);
		expect(
			// @ts-expect-error testing unsupported connector
			() => createChecker(db, "notsupported"),
		).toThrowError(
			"Invalid enum value. Expected 'sqlite' | 'libsql' | 'bun-sqlite' | 'cloudflare-d1', received 'notsupported'",
		);
	});
});
