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
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const columns = keys.join(', ');
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await DB.env.DB.prepare(sql).bind(...values).run();
    return result;
  },

  async update(table, data, whereKey, whereValue) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map(k => `${k} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause}, updated_at = datetime('now') WHERE ${whereKey} = ?`;
    const result = await DB.env.DB.prepare(sql).bind(...values, whereValue).run();
    return result;
  },

  async delete(table, key, value) {
    const sql = `DELETE FROM ${table} WHERE ${key} = ?`;
    const result = await DB.env.DB.prepare(sql).bind(value).run();
    return result;
  },

  async paginate(sql, params = [], page = 1, perPage = 20) {
    const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
    const countResult = await DB.env.DB.prepare(countSql).bind(...params).first();
    const total = countResult.total || 0;
    const offset = (page - 1) * perPage;
    const dataSql = `${sql} LIMIT ? OFFSET ?`;
    const data = await DB.env.DB.prepare(dataSql).bind(...params, perPage, offset).all();
    return {
      data: data.results || [],
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    };
  },

  setEnv(env) {
    DB.env = env;
  },
};

DB.env = {};

export default DB;
