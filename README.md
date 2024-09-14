# drizzle-schema-checker

Checks if a Drizzle schema is also valid in a database.

uses [unjs/db0](https://github.com/unjs/db0) to connect your database.

---

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Codecov][codecov-src]][codecov-href]

---

## Installation

```bash
npm install drizzle-schema-checker
# or
pnpm add drizzle-schema-checker
```

## Usage

First, create your schemas using Zod:

```typescript
// schema.ts
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const userTable = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  password: text("password"),
  email: text("email").notNull().unique(),
  created_at: integer("created_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

Then, use the `checkDatabaseValidity` function to validate your database:

```typescript
// your db stuff
import { createChecker } from 'drizzle-schema-checker';
import sqlite from "db0/connectors/better-sqlite3";
import { createDatabase } from "db0";
import { userTable } from './schema';

const db = createDatabase(sqlite());
const dbChecker = createChecker(db, "sqlite");

try {
  const validatedTable = await checker.checkTable("user", userTable);
  console.log('table user is valid in db');
} catch (error) {
  console.error(error.message);
}
```


## Roadmap

- [x] Remove any [slip](https://github.com/adrienZ/slip) code
  - [x] tableNames
- [x] [SQLite](https://db0.unjs.io/connectors/sqlite) support
- [x] [Bun SQlite](https://db0.unjs.io/connectors/bun) support
- [x] [LibSQL](https://db0.unjs.io/connectors/libsql) support
- [ ] [PostgreSQL](https://db0.unjs.io/connectors/postgresql) support
- [ ] [Cloudflare D1](https://db0.unjs.io/connectors/cloudflare) support
- [ ] [MySQL](https://db0.unjs.io/connectors/mysql) support

## Development

### Prerequisites

- pnpm
- Bun (for testing)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/adrienZ/drizzle-schema-checker.git
   cd drizzle-schema-checker
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Build the project:
   ```
   pnpm build
   ```

### Testing

To run tests using Vitest:

```
pnpm test
```

To run tests with coverage:

```
pnpm test:ci
```

### Linting and Formatting

- Lint: `pnpm lint`
- Format: `pnpm format`

## License

MIT


<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/drizzle-schema-checker/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/drizzle-schema-checker

[npm-downloads-src]: https://img.shields.io/npm/dm/drizzle-schema-checker.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npmjs.com/package/drizzle-schema-checker

[license-src]: https://img.shields.io/npm/l/drizzle-schema-checker.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/drizzle-schema-checker


[codecov-src]: https://codecov.io/gh/adrienZ/drizzle-schema-checker/graph/badge.svg?token=SPS4DURB2A
[codecov-href]: https://codecov.io/gh/adrienZ/drizzle-schema-checker
