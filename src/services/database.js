import { validateTableName } from './auth.js';

const VALID_COLUMN_RE = /^[a-z_][a-z0-9_]*$/;
const tableColumnsCache = new Map();

function validateColumnName(name) {
  if (!VALID_COLUMN_RE.test(name)) {
    throw new Error(`Nombre de columna inválido: ${name}`);
  }
}

async function hasColumn(table, column) {
  if (tableColumnsCache.has(table)) return tableColumnsCache.get(table).has(column);
  try {
    const result = await DB.env.DB.prepare(`PRAGMA table_info(${table})`).all();
    const cols = new Set((result.results || []).map(r => r.name));
    tableColumnsCache.set(table, cols);
    return cols.has(column);
  } catch {
    return false;
  }
}

const DB = {
  async query(sql, params = []) {
    const result = await DB.env.DB.prepare(sql).bind(...params).all();
    return result.results || [];
  },

  async get(sql, params = []) {
    const result = await DB.env.DB.prepare(sql).bind(...params).first();
    return result || null;
  },

  async run(sql, params = []) {
    const result = await DB.env.DB.prepare(sql).bind(...params).run();
    return result;
  },

  async insert(table, data) {
    validateTableName(table);
    const keys = Object.keys(data);
    keys.forEach(validateColumnName);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await DB.env.DB.prepare(sql).bind(...values).run();
    return result;
  },

  async update(table, data, whereKey, whereValue, opts = {}) {
    validateTableName(table);
    validateColumnName(whereKey);
    const keys = Object.keys(data);
    keys.forEach(validateColumnName);
    const values = Object.values(data);
    const setParts = keys.map(k => `${k} = ?`);
    if (opts.withTimestamp !== false) {
      const supportsUpdated = await hasColumn(table, 'updated_at');
      if (supportsUpdated) {
        setParts.push(`updated_at = datetime('now')`);
      }
    }
    const setClause = setParts.join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereKey} = ?`;
    const result = await DB.env.DB.prepare(sql).bind(...values, whereValue).run();
    return result;
  },

  async delete(table, key, value) {
    validateTableName(table);
    validateColumnName(key);
    const sql = `DELETE FROM ${table} WHERE ${key} = ?`;
    const result = await DB.env.DB.prepare(sql).bind(value).run();
    return result;
  },

  setEnv(env) {
    DB.env = env;
  },
};

DB.env = {};

export default DB;
