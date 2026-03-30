import os
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor

app = FastAPI(title="CryptoAnalytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DB = dict(
    host=os.getenv("POSTGRES_HOST", "postgres"),
    port=int(os.getenv("POSTGRES_PORT", 5432)),
    dbname=os.getenv("POSTGRES_DB", "crypto_metrics"),
    user=os.getenv("POSTGRES_USER", "postgres"),
    password=os.getenv("POSTGRES_PASSWORD", "admin"),
)


def conn():
    return psycopg2.connect(**DB, cursor_factory=RealDictCursor)


def query(sql, params=()):
    with conn() as c:
        with c.cursor() as cur:
            cur.execute(sql, params)
            return [dict(r) for r in cur.fetchall()]


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/api/coins/latest")
def latest_prices():
    return query("""
        SELECT DISTINCT ON (id)
            timestamp, id, symbol, price, change_1min, change_5min, sma, ema, volatility
        FROM crypto_table
        ORDER BY id, timestamp DESC
    """)


@app.get("/api/coins")
def coin_list():
    return query("SELECT DISTINCT id, symbol FROM crypto_table ORDER BY id")


@app.get("/api/coins/{coin_id}/history")
def coin_history(coin_id: str, minutes: int = Query(60, ge=5, le=1440)):
    return query("""
        SELECT timestamp, price, change_1min, change_5min, sma, ema, volatility
        FROM crypto_table
        WHERE id = %s AND timestamp >= NOW() - (%s || ' minutes')::interval
        ORDER BY timestamp ASC
    """, (coin_id, minutes))


@app.get("/api/ohlcv/{coin_id}")
def ohlcv(coin_id: str, minutes: int = Query(60, ge=5, le=1440)):
    return query("""
        SELECT timestamp, open, high, low, close
        FROM ohlcv_1min
        WHERE id = %s AND timestamp >= NOW() - (%s || ' minutes')::interval
        ORDER BY timestamp ASC
    """, (coin_id, minutes))


@app.get("/api/gainers")
def gainers():
    return query("SELECT rank, id, symbol, price, change_5min FROM top_5_gainers ORDER BY rank")


@app.get("/api/losers")
def losers():
    return query("SELECT rank, id, symbol, price, change_5min FROM top_5_losers ORDER BY rank")


@app.get("/api/alerts")
def alerts():
    return query("""
        SELECT alerted_at, coin_id, symbol, price, change_5min, alert_type
        FROM price_alerts
        ORDER BY alerted_at DESC
        LIMIT 50
    """)


@app.get("/api/pipeline")
def pipeline():
    return query("""
        SELECT DISTINCT ON (task)
            task, status, records_pushed, latency_ms, created_at
        FROM pipeline_metrics
        ORDER BY task, created_at DESC
    """)


@app.get("/api/stats")
def stats():
    rows = query("""
        SELECT
            (SELECT COUNT(DISTINCT id) FROM crypto_table) AS coins_tracked,
            (SELECT MAX(timestamp) FROM crypto_table)     AS last_updated,
            (SELECT COUNT(*) FROM ohlcv_1min)             AS ohlcv_candles,
            (SELECT COUNT(*) FROM price_alerts)           AS total_alerts
    """)
    return rows[0] if rows else {}
