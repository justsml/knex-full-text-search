import 'knex';
import { Knex, knex } from 'knex';

/**
 * # Knex Full-Text Search Plugin
 *
 * This plugin adds some useful methods to the knex query builder: selectWebSearchRank, whereWebSearch.
 *
 * ## Usage
 *
 * ```ts
 * import Knex from 'knex';
 * import KnexFullTextSearch from 'knex-full-text-search-plugin';
 *
 * export const db = Knex(config);
 * 
 * KnexFullTextSearch(db);
 * 
 * const results = await db('products')
 *   .selectWebSearchRank('description', 'Shoes')
 *   .whereWebSearch('description', 'Shoes')
 *   .orderBy('rank', 'desc');
 * ```
 */
export default function knexFullTextSearch(db: Knex) {
  try {
    knex.QueryBuilder.extend(
    'whereWebSearch',
    function whereWebSearch(
      tsVectorColumn: string,
      query: string | null | undefined,
    ) {
      return query === undefined
        ? this
        : this.whereRaw(`?? @@ websearch_to_tsquery('simple', ?)`, [
            tsVectorColumn,
            query,
          ]);
    },
  );
  knex.QueryBuilder.extend(
    'selectWebSearchRank',
    function selectWebSearchRank(
      tsVectorColumn: string,
      query: string | null | undefined,
      columnAlias = 'rank',
    ) {
      return query === undefined
        ? this
        : this.select(
            db.raw(`ts_rank(??, websearch_to_tsquery('simple', ?)) as ??`, [
              tsVectorColumn,
              query,
              columnAlias,
            ]),
          );
    },
  );
  } catch (e) {
    // Show error if it's not the expected error
    if (!e.message?.includes('extend')) console.error('Error extending knex.QueryBuilder', e);
  }
  return db;
}

declare module 'knex' {
  namespace Knex {
    interface QueryInterface<TRecord extends {} = any, TResult = any> {

      /**
       * Query a tsvector column using postgres function `websearch_to_tsquery`.
       * 
       * Used in conjunction with `selectWebSearchRank` to order results by rank/score.
       * 
       * **Note:** Intelligently handles `undefined` input by returning the query builder unmodified.
       * 
       * ```ts
       * const results = await db('products')
       *   .select('id', 'name')
       *   .selectWebSearchRank('description', 'Shoes')
       *   .whereWebSearch('description', 'Shoes')
       *   .orderBy('rank', 'desc');
       * ```
       * 
       * @param tsVectorColumn The tsvector column to query.
       * @param query The query string.
       * 
       */
      whereWebSearch(
        tsVectorColumn: string,
        query: string | null | undefined,
      ): QueryBuilder<TRecord, TResult>;

      /**
       * Add a column with a rank/score for the given query.
       * 
       * The column alias defaults to `rank`.
       * 
       * The rank/score is calculated using postgres function `ts_rank`.
       * 
       * ```ts
       * const results = await db('products')
       *  .select('id', 'name')
       *  .selectWebSearchRank('description', 'Shoes')
       *  .whereWebSearch('description', 'Shoes')
       *  .orderBy('rank', 'desc');
       * ```
       * 
       * @param tsVectorColumn The tsvector column to query.
       * @param query The query string.
       * @param columnAlias The alias for the rank/score column.
       */
      selectWebSearchRank(
        tsVectorColumn: string,
        query: string | null | undefined,
        columnAlias?: string,
      ): QueryBuilder<TRecord, TResult>;

    }
  }
}