-- Belépett user-ekhez havi tier-quota (free=50/start=500/pro=5000).
-- A tier a `subscriptions.plan_id`-ból jön (közös cloud-csomag, mind a 3 brand).

CREATE TABLE IF NOT EXISTS szovegelek_user_quota (
  user_id     TEXT NOT NULL,
  month_key   TEXT NOT NULL,           -- YYYY-MM (UTC)
  used        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, month_key)
);

CREATE INDEX IF NOT EXISTS idx_szovegelek_user_quota_month
  ON szovegelek_user_quota(month_key);
