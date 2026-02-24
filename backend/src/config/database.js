/**
 * PostgreSQL 数据库配置与查询助手
 */

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'youji_family',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000
});

const convertPlaceholders = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

const isInsert = (sql) => /^\s*insert\s+into\s+/i.test(sql);
const hasReturning = (sql) => /\breturning\b/i.test(sql);

const query = async (sql, params = []) => {
  const pgSqlBase = convertPlaceholders(sql);
  const pgSql = isInsert(pgSqlBase) && !hasReturning(pgSqlBase)
    ? `${pgSqlBase} RETURNING id`
    : pgSqlBase;

  const result = await pool.query(pgSql, params);

  if (/^\s*select\s+/i.test(sql)) {
    return result.rows;
  }

  if (isInsert(sql)) {
    return [{
      insertId: result.rows?.[0]?.id,
      affectedRows: result.rowCount
    }];
  }

  return [{ affectedRows: result.rowCount }];
};

const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ PostgreSQL 连接成功');
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL 连接失败:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  testConnection
};
