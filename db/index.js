/*
 * DB interface defined here
 */

const { Pool } = require('pg');

class DB {
  constructor(dbParams) {
    const existingPool = DB.findPool(dbParams);
    if (existingPool) return existingPool;

    this.params = dbParams;
    this.pool = new Pool(dbParams);
    DB.registerPool(this);
  }

  static findPool(dbParams) {
    return DB.pools.find(({ params: { user, host, database } }) => user === dbParams.user && host === dbParams.host && database === dbParams.database);
  }

  static registerPool(db) {
    DB._pools.push(db);
  }

  static get pools() {
    return DB._pools;
  }

  /**
   * Perfoms SQL queries
   * @param {string} text - SQL query. Params in the string must appear as '$n', n referring to their respective position (1-based) in the params array.
   * @param {any[]} [params] - Parameters to be parsed into the SQL query.
   * @return Promise resolving to an array of the entries matching the SQL query.
   */
  query(text, params = []) {
    return this.pool.query(text, params).then(data => data.rows);
  }

  /**
   * Perfoms SQL transactions
   * All queries are executed on the same client
   * @param {Array<[string, Function | any[]]>} queryPairs - Array of SQL string/parameters pairs. Parameters are optional. If supplied they should be in the form of an array or alternatively a callback function which shall return an array. If passed a callback, it will be called with one argument: the return value of the previous SQL query.
   * @return Promise resolving to an array of the entries matching the last SQL query.
   */

  transaction(queryPairs) {
    return (async () => {
      const client = await this.pool.connect();
      try {
        // start transaction
        let lastQuery = (await client.query('BEGIN')).rows;

        // loop through queries
        for (let [text, params = []] of queryPairs) {
          params = params instanceof Function && (params(lastQuery) || []) || params;
          lastQuery = (await client.query(text, params)).rows;
        }

        // commit if no errors
        await client.query('COMMIT');

        return lastQuery;

      } catch (err) {
        // if error, rollback all changes to db
        await client.query('ROLLBACK');
        throw err;

      } finally {
        // in all instances, release the client to the pool
        client.release();
      }
    })();
  }

}

// Static property
DB._pools = [];

module.exports = (dbParams) => {
  return new DB(dbParams);
};
