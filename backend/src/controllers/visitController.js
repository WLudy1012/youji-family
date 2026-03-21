const { query } = require('../config/database');

let ensureVisitTablePromise = null;

const ensureVisitTable = async () => {
  if (!ensureVisitTablePromise) {
    ensureVisitTablePromise = query(`
      CREATE TABLE IF NOT EXISTS page_visits (
        id SERIAL PRIMARY KEY,
        visitor_id VARCHAR(64) NOT NULL,
        visit_path VARCHAR(255) NOT NULL DEFAULT '/',
        ip_address VARCHAR(45),
        user_agent VARCHAR(255),
        visited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
        visit_hour SMALLINT NOT NULL DEFAULT EXTRACT(HOUR FROM CURRENT_TIMESTAMP),
        UNIQUE(visitor_id, visit_date, visit_hour, visit_path)
      )
    `).catch((error) => {
      ensureVisitTablePromise = null;
      throw error;
    });
  }

  await ensureVisitTablePromise;
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.connection?.remoteAddress || null;
};

/**
 * 记录访问
 * POST /api/visits/track
 */
const trackVisit = async (req, res, next) => {
  try {
    await ensureVisitTable();

    const visitorIdRaw = req.body?.visitorId;
    if (!visitorIdRaw || typeof visitorIdRaw !== 'string') {
      return res.status(400).json({ success: false, message: 'visitorId 必填' });
    }

    const visitorId = visitorIdRaw.slice(0, 64);
    const visitPath = typeof req.body?.path === 'string' && req.body.path.trim()
      ? req.body.path.trim().slice(0, 255)
      : '/';

    const ipAddress = getClientIp(req);
    const userAgent = (req.headers['user-agent'] || '').slice(0, 255);

    await query(
      `INSERT INTO page_visits (visitor_id, visit_path, ip_address, user_agent, visited_at, visit_date, visit_hour)
       VALUES (?, ?, ?, ?, NOW(), CURRENT_DATE, EXTRACT(HOUR FROM NOW()))
       ON CONFLICT (visitor_id, visit_date, visit_hour, visit_path) DO NOTHING`,
      [visitorId, visitPath, ipAddress, userAgent]
    );

    res.json({ success: true, message: '访问记录成功' });
  } catch (error) {
    next(error);
  }
};

/**
 * 后台访问统计
 * GET /api/admin/visits/stats
 */
const getVisitStats = async (req, res, next) => {
  try {
    await ensureVisitTable();

    const [todayRes, yesterdayRes, sevenDaysRes, thirtyDaysRes, totalRes, trend24h, trend7d, trend30d] = await Promise.all([
      query('SELECT COUNT(DISTINCT visitor_id) AS total FROM page_visits WHERE visit_date = CURRENT_DATE'),
      query('SELECT COUNT(DISTINCT visitor_id) AS total FROM page_visits WHERE visit_date = CURRENT_DATE - INTERVAL \'1 day\''),
      query('SELECT COUNT(DISTINCT visitor_id) AS total FROM page_visits WHERE visit_date >= CURRENT_DATE - INTERVAL \'6 day\''),
      query('SELECT COUNT(DISTINCT visitor_id) AS total FROM page_visits WHERE visit_date >= CURRENT_DATE - INTERVAL \'29 day\''),
      query('SELECT COUNT(DISTINCT visitor_id) AS total FROM page_visits'),
      query(`
        SELECT
          TO_CHAR(s.ts, 'MM-DD HH24:00') AS label,
          COALESCE(v.total, 0) AS count
        FROM generate_series(
          date_trunc('hour', NOW()) - INTERVAL '23 hour',
          date_trunc('hour', NOW()),
          INTERVAL '1 hour'
        ) AS s(ts)
        LEFT JOIN (
          SELECT date_trunc('hour', visited_at) AS bucket, COUNT(DISTINCT visitor_id) AS total
          FROM page_visits
          WHERE visited_at >= NOW() - INTERVAL '24 hour'
          GROUP BY bucket
        ) AS v ON v.bucket = s.ts
        ORDER BY s.ts
      `),
      query(`
        SELECT
          TO_CHAR(s.day, 'MM-DD') AS label,
          COALESCE(v.total, 0) AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS s(day)
        LEFT JOIN (
          SELECT visit_date AS day, COUNT(DISTINCT visitor_id) AS total
          FROM page_visits
          WHERE visit_date >= CURRENT_DATE - INTERVAL '6 day'
          GROUP BY visit_date
        ) AS v ON v.day = s.day::date
        ORDER BY s.day
      `),
      query(`
        SELECT
          TO_CHAR(s.day, 'MM-DD') AS label,
          COALESCE(v.total, 0) AS count
        FROM generate_series(CURRENT_DATE - INTERVAL '29 day', CURRENT_DATE, INTERVAL '1 day') AS s(day)
        LEFT JOIN (
          SELECT visit_date AS day, COUNT(DISTINCT visitor_id) AS total
          FROM page_visits
          WHERE visit_date >= CURRENT_DATE - INTERVAL '29 day'
          GROUP BY visit_date
        ) AS v ON v.day = s.day::date
        ORDER BY s.day
      `)
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          today: Number(todayRes[0]?.total || 0),
          yesterday: Number(yesterdayRes[0]?.total || 0),
          last7Days: Number(sevenDaysRes[0]?.total || 0),
          last30Days: Number(thirtyDaysRes[0]?.total || 0),
          totalUniqueVisitors: Number(totalRes[0]?.total || 0)
        },
        trends: {
          last24Hours: trend24h.map((item) => ({ label: item.label, count: Number(item.count) })),
          last7Days: trend7d.map((item) => ({ label: item.label, count: Number(item.count) })),
          last30Days: trend30d.map((item) => ({ label: item.label, count: Number(item.count) }))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  trackVisit,
  getVisitStats
};
