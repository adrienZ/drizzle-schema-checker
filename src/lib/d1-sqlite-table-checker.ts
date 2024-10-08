import {
	getTableConfig,
	type PrimaryKey,
	type SQLiteColumn,
	type ForeignKey,
	type SQLiteTable,
} from "drizzle-orm/sqlite-core";
import { getTableName } from "drizzle-orm";
import type { Database } from "db0";
import { z } from "zod";
import { TableChecker } from "./table-checker";

// #region HELPERS
const sqliteTableInfoRowSchema = z.object({
	cid: z.number(),
	name: z.string(),
	type: z.string(),
	notnull: z.number(),
	dflt_value: z.any(),
	pk: z.number(),
});

const sqliteDrizzleColumnTypeMapping = {
	SQLiteText: "TEXT",
	SQLiteInteger: "INTEGER",
	SQLiteTimestamp: "TIMESTAMP",
	SQLiteBoolean: "BOOLEAN",
};
function getSQLiteColumType(drizzleColumnType: string) {
	return (
		sqliteDrizzleColumnTypeMapping[
			drizzleColumnType as keyof typeof sqliteDrizzleColumnTypeMapping
		] || drizzleColumnType
	);
}

function createSQLiteTableExistSchema(tableName: string) {
	return z
		.array(sqliteTableInfoRowSchema)
		.min(1, `${tableName} table for SLIP does not exist`);
}

const findColumnInSQLiteTableInfo = <T extends { name: string }>(
	source: T[],
	columnName: string,
) => {
	return source.find(
		(columnFromSQLite) => columnFromSQLite.name === columnName,
	);
};
const findColumnInSQLiteTableForeignKeys = <T extends { from: string }>(
	source: T[],
	columnName: string,
) => {
	return source.find(
		(columnFromSQLite) => columnFromSQLite.from === columnName,
	);
};
// #endregion

// handle cloudflare client
function unwrapResults<T>(dbResult: T): T {
	const resultsCasted = dbResult as { results?: unknown}
	return resultsCasted.results ? resultsCasted.results as T : dbResult;
}

async function validateDabaseWithSchema(
	db: Database,
	tableName: string,
	drizzleTableInfos: {
		columns: SQLiteColumn[];
		primaryKeys: PrimaryKey[];
		foreignKeys: ForeignKey[];
	},
): Promise<string | null> {
	const maybeTableInfo = await db
		.prepare(`PRAGMA table_info(${tableName})`)
		.all();
	const {
		success,
		error,
		data: tableInfo,
	} = createSQLiteTableExistSchema(tableName).safeParse(unwrapResults(maybeTableInfo));
	

	if (!success) {
		throw new Error(error.errors[0]?.message);
	}
	
	// Check if all columns from schema exist in SQLite table
	for (const columnFromSchema of drizzleTableInfos.columns) {
		const correspondingColumn = findColumnInSQLiteTableInfo(
			tableInfo,
			columnFromSchema.name,
		);

		if (!correspondingColumn) {
			return `${tableName} table must contain a column with name "${columnFromSchema.name}"`;
		}

		if (
			correspondingColumn.type !==
			getSQLiteColumType(columnFromSchema.columnType)
		) {
			return `${tableName} table must contain a column "${columnFromSchema.name}" with type "${getSQLiteColumType(columnFromSchema.columnType)}"`;
		}

		const primaryKeysColumnsNames = drizzleTableInfos.primaryKeys
			.at(0)
			?.columns.map((col) => col.name);
		if (
			(columnFromSchema.primary ||
				primaryKeysColumnsNames?.includes(columnFromSchema.name)) &&
			correspondingColumn.pk < 1
		) {
			return `${tableName} table must contain a column "${columnFromSchema.name}" as primary key`;
		}

		if (columnFromSchema.notNull && correspondingColumn.notnull !== 1) {
			return `${tableName} table must contain a column "${columnFromSchema.name}" not nullable`;
		}

		const indexesInTableSQLite = await db.prepare(`SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = '${tableName}';`).all() as Array<{ name: string }>;

		const uniqueIndexesSQLite = await Promise.all(
			unwrapResults(indexesInTableSQLite)
				.map((uniqueIndex) => {
					return db
						.prepare(`PRAGMA index_info(${uniqueIndex.name})`)
						.all() as Promise<Array<{ name: string }>>;
				}),
		);

		if (
			columnFromSchema.isUnique &&
			unwrapResults(uniqueIndexesSQLite).find(
				(uniqueIndex) => columnFromSchema.name === unwrapResults(uniqueIndex).at(0)?.name,
			) === undefined
		) {
			return `${tableName} table must contain a column "${columnFromSchema.name}" unique`;
		}

		const defaultData = columnFromSchema.default
			? (columnFromSchema.default as {
					queryChunks?: Array<{ value?: string[] }>;
				})
			: null;
		const defaultValue = defaultData?.queryChunks?.at(0)?.value?.at(0);

		if (
			Boolean(columnFromSchema.hasDefault && defaultValue) &&
			(!correspondingColumn.dflt_value ||
				correspondingColumn.dflt_value !== defaultValue)
		) {
			return `${tableName} table must contain a column with name "${columnFromSchema.name}" with default value of ${defaultValue}`;
		}
	}

	const foreignKeysTable = drizzleTableInfos.foreignKeys;
	const foreignKeysSQLite = (await db
		.prepare(`PRAGMA foreign_key_list(${tableName})`)
		.all()) as Array<{ table: string; from: string; to: string; name: string }>;

	for (const foreignKeyData of foreignKeysTable) {
		const reference = foreignKeyData.reference();

		for (const foreignKeyColumn of reference.columns) {
			const fcorrespondingColumn = findColumnInSQLiteTableForeignKeys(
				unwrapResults(foreignKeysSQLite),
				foreignKeyColumn.name,
			);

			if (!fcorrespondingColumn) {
				return `${tableName} table should have a foreign key "${foreignKeyColumn.name}"`;
			}

			const targetTableName = getTableName(reference.foreignTable);
			const targetColumnName = reference.foreignColumns[0]?.name;
			if (
				fcorrespondingColumn.table !== targetTableName ||
				fcorrespondingColumn.to !== targetColumnName
			) {
				return `foreign key "${fcorrespondingColumn.from}" in ${tableName} table should target "${targetColumnName}" column from the "${targetTableName}" table`;
			}
		}
	}

	return null;
}

export class D1SqliteTableChecker extends TableChecker {
	override async checkTable(tableName: string, schema: SQLiteTable) {
		const error = await validateDabaseWithSchema(
			this.dbClient,
			tableName,
			getTableConfig(schema),
		);

		if (error) {
			throw new Error(error);
		}

		return true;
	}
}
