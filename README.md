# Knex Full-text Search Plugin

[![NPM version](https://img.shields.io/npm/v/knex-full-text-search-plugin.svg)](https://www.npmjs.com/package/knex-full-text-search-plugin)
[![GitHub stars](https://img.shields.io/github/stars/justsml/knex-full-text-search.svg?style=social)](https://github.com/justsml/knex-full-text-search)

A Knex plugin for easy Full-text Search queries in Postgres.

## Get Started

```bash
npm install knex-full-text-search-plugin
# OR
yarn add knex-full-text-search-plugin
```

Once installed, add the plugin to your Knex instance:

```ts
import Knex from 'knex';
import KnexFullTextSearchPlugin from 'knex-full-text-search-plugin';

export const db = Knex(config);

// Simply call the plugin with your Knex instance
KnexFullTextSearchPlugin(db);
```

## Methods

### `selectWebSearchRank`

Add a column with a rank/score for the given query.

The column alias defaults to `rank`.

The rank/score is calculated using the Postgres function `ts_rank`.

```ts
const results = await db('products')
    .select('id', 'name')
    .selectWebSearchRank('description', 'Shoes')
    .whereWebSearch('description', 'Shoes')
    .orderBy('rank', 'desc');
```

Will produce [the following SQL](https://replit.com/@justsml/Knex-Postgres-Full-Text-Search-Example#index.ts) query:

```sql
select id, name, ts_rank(`description`, websearch_to_tsquery('simple', 'Shoes')) as `rank`
  from products
  where `description` @@ websearch_to_tsquery('simple', 'Shoes')
  order by `rank` desc;
```

### `whereWebSearch`

Add a `WHERE` clause to your query to filter by the given query.

> Use in conjunction with `selectWebSearchRank` to compute a `rank` to order the results.

**Note:** Intelligently handles `undefined` input by returning the query builder unmodified.

```ts
const results = await db('products')
  .select('id', 'name')
  .whereWebSearch('description', 'Shoes')
```

Will produce [the following SQL](https://replit.com/@justsml/Knex-Postgres-Full-Text-Search-Example#index.ts) query:

```sql
select id, name
  from products
  where `description` @@ websearch_to_tsquery('simple', 'Shoes');
```
