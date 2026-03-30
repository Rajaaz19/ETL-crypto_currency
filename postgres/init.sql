-- ── Crypto metrics ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crypto_table (
    timestamp   TIMESTAMP,
    id          TEXT,
    symbol      TEXT,
    price       DOUBLE PRECISION,
    change_1min DOUBLE PRECISION,
    change_5min DOUBLE PRECISION,
    sma         DOUBLE PRECISION,
    ema         DOUBLE PRECISION,
    volatility  DOUBLE PRECISION
);
CREATE UNIQUE INDEX IF NOT EXISTS crypto_table_id_ts ON crypto_table (id, timestamp);
CREATE INDEX IF NOT EXISTS crypto_table_ts ON crypto_table (timestamp DESC);

-- ── Top 5 gainers / losers ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS top_5_gainers (
    rank        INTEGER NOT NULL,
    id          TEXT,
    symbol      TEXT,
    price       DOUBLE PRECISION,
    change_5min DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS top_5_losers (
    rank        INTEGER NOT NULL,
    id          TEXT,
    symbol      TEXT,
    price       DOUBLE PRECISION,
    change_5min DOUBLE PRECISION
);

-- ── OHLCV 1-minute candles ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ohlcv_1min (
    id        TEXT,
    symbol    TEXT,
    timestamp TIMESTAMP,
    open      DOUBLE PRECISION,
    high      DOUBLE PRECISION,
    low       DOUBLE PRECISION,
    close     DOUBLE PRECISION
);
CREATE UNIQUE INDEX IF NOT EXISTS ohlcv_id_ts ON ohlcv_1min (id, timestamp);
CREATE INDEX IF NOT EXISTS ohlcv_ts ON ohlcv_1min (timestamp DESC);

-- ── Price alerts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_alerts (
    id          SERIAL PRIMARY KEY,
    alerted_at  TIMESTAMP DEFAULT NOW(),
    coin_id     TEXT,
    symbol      TEXT,
    price       DOUBLE PRECISION,
    change_5min DOUBLE PRECISION,
    alert_type  TEXT
);
CREATE INDEX IF NOT EXISTS price_alerts_ts ON price_alerts (alerted_at DESC);

-- ── Pipeline monitoring ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pipeline_metrics (
    id             SERIAL PRIMARY KEY,
    run_id         TEXT NOT NULL,
    task           TEXT NOT NULL,
    status         TEXT NOT NULL,
    records_pushed INTEGER DEFAULT 0,
    latency_ms     INTEGER DEFAULT 0,
    error_message  TEXT,
    created_at     TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS pipeline_metrics_ts ON pipeline_metrics (created_at DESC);

CREATE TABLE IF NOT EXISTS dead_letter_queue (
    id            SERIAL PRIMARY KEY,
    run_id        TEXT NOT NULL,
    payload       TEXT,
    error_message TEXT NOT NULL,
    created_at    TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS dlq_ts ON dead_letter_queue (created_at DESC);
