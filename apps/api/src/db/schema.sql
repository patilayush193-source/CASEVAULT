CREATE TABLE IF NOT EXISTS users (
  id         TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS slides (
  id                TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  competition_name  TEXT NOT NULL,
  year              INTEGER NOT NULL,
  category          TEXT NOT NULL,
  executive_summary TEXT,
  file_path         TEXT NOT NULL,
  preview_image     TEXT,
  views             INTEGER NOT NULL DEFAULT 0,
  created_at        INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_slides_category ON slides(category);
CREATE INDEX IF NOT EXISTS idx_slides_year     ON slides(year);
CREATE INDEX IF NOT EXISTS idx_slides_created  ON slides(created_at DESC);
