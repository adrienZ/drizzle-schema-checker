import {
	getTableConfig,
	type PrimaryKey,
	type PgColumn,
	type ForeignKey,
	type PgTable,
} from "drizzle-orm/pg-core";
import { getTableName } from "drizzle-orm";
import type { Database } from "db0";
import { z } from "zod";
import { TableChecker } from "./table-checker";


export class PostgresTableChecker extends TableChecker {
	override async checkTable(tableName: string, schema: PgTable) {
		// const error = await validateDabaseWithSchema(
		// 	this.dbClient,
		// 	tableName,
		// 	getTableConfig(schema),
		// );

		// if (error) {
		// 	throw new Error(error);
		// }

    console.log(tableName, schema);
    

		return true;
	}
}
