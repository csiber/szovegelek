-- Anonim IP-quota a /api/generate endpoint-hoz.
-- 20 generálás / IP / hónap, regisztráció nélkül.
-- A regisztrált usereknek külön (közös D1 user-quota a meglévő rendszerben).

CREATE TABLE IF NOT EXISTS szovegelek_anon_quota (
  ip          TEXT NOT NULL,
  month_key   TEXT NOT NULL,           -- YYYY-MM (UTC)
  used        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (ip, month_key)
);

CREATE INDEX IF NOT EXISTS idx_szovegelek_anon_quota_month
  ON szovegelek_anon_quota(month_key);
