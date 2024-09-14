import type { Database } from "db0";

export class TableChecker {
	dbClient: Database;

	constructor(dbClient: Database) {
		this.dbClient = dbClient;
	}

	async checkTable(taleName: string, schema: unknown): Promise<boolean> {
		throw new Error("checkTable not implemented");
	}
}
