# drizzle-schema-checker

A simple schema checker for Drizzle.js databases using Zod validation.

## Features

- Validates table names and database structure against predefined schemas.
- Throws helpful error messages when validation fails.
- Supports both `better-sqlite3` and `@libsql/client` engines.

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
import { z } from 'zod';

export const TableNamesSchema = z.object({
  users: z.string(),
  sessions: z.string(),
});

export type DatabaseSchemaType = {
  tables: Record<string, unknown>;
  // add other database properties here...
};

export const DatabaseSchema = z.object({
  tables: z.record(z.unknown()),
});
```

Then, use the `checkDatabaseValidity` function to validate your database:

```typescript
import { checkDatabaseValidity } from 'drizzle-schema-checker';
import { TableNamesSchema } from './schema.ts';

const db = /* your drizzle.js database */;
const tableNames = {
  users: 'users',
  sessions: 'sessions',
};

try {
  const validatedDb = checkDatabaseValidity(db, tableNames);
  console.log('Database is valid:', validatedDb);
} catch (error) {
  console.error('Invalid database:', error.message);
}
```

## Development

### Prerequisites

- pnpm
- Bun (for testing)

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/drizzle-schema-checker.git
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

ISC © [Your Name]

---

_This README was generated with ❤️ by your name_

*For more information on how to contribute, please refer to the [contributing guidelines](CONTRIBUTING.md).*