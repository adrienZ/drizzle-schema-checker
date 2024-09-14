import type { ConnectorName, Database } from "db0";
import z from "zod";
import consola from "consola";
import { SqliteTableChecker } from "./lib/sqlite-table-checker";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";

export type supportedConnectors = Extract<
	ConnectorName,
	"sqlite" | "libsql" | "bun-sqlite"
>;
const CONNECTOR_NAME = [
	"sqlite",
	"libsql",
	"bun-sqlite",
] as const satisfies supportedConnectors[];

const DatabaseSchema = z.object({
	exec: z.function(),
	prepare: z.function(),
	sql: z.function(),
});

export function checkDatabaseValidity(
	db: unknown,
): Database {
	if (!db) {
		throw new Error("No database to check, please provide one");
	}

	const { data: validatedDatabase, success: databaseValidity } =
		DatabaseSchema.safeParse(db);
	if (!databaseValidity) {
		throw new Error(
			"The provided database is not a valid db0 database, see https://github.com/unjs/db0",
		);
	}

	return validatedDatabase as Database;
}

export function createChecker(
	database: Database,
	connectorType: ConnectorName,
) {
	checkDatabaseValidity(database);

	if (CONNECTOR_NAME.includes(connectorType as supportedConnectors) === false) {
			throw new Error(
				`Invalid enum value. Expected ${CONNECTOR_NAME.map((name) => `'${name}'`).join(" | ")}, received '${connectorType}'`,
			);
	}

	const tableChecker: SqliteTableChecker =  new SqliteTableChecker(database);

	const checkTableWithSchema = async (tableName: string, schema: unknown) => {
		// TODO: remove casting when supporting non-sqlite connectors
		const isTableOk = await tableChecker.checkTable(tableName, schema as SQLiteTable);
		consola.success(`Table "${tableName}" exists and has a valid schema`);

		return isTableOk;
	}

	return { checkTableWithSchema }
}
