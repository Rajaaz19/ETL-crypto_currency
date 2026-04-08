# MarketFlow Atlas — Real-Time Cryptocurrency ETL Pipeline

A production-grade real-time cryptocurrency analytics platform that ingests live crypto price data, processes it through a distributed ETL pipeline, performs technical analysis, and presents insights through a live web dashboard.

---

## Architecture Overview

```
CoinGecko API
      ↓
Airflow (Producer DAG — every 1 min)
      ↓
Kafka (crypto-prices topic)
      ↓
Spark Streaming → MinIO (Parquet files)
      ↓
Spark Analytics (every 5 min) → PostgreSQL
      ↓
FastAPI → React Dashboard
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Ingestion | Apache Kafka 7.6.0, CoinGecko API |
| Orchestration | Apache Airflow 2.10.4 |
| Processing | Apache Spark 3.5.1 (Streaming + Batch) |
| Storage | PostgreSQL 16, MinIO (S3-compatible Parquet) |
| Backend API | FastAPI 0.111.0, Python 3.11 |
| Frontend | React 18.2, Recharts, TailwindCSS, Vite |
| Infrastructure | Docker, Docker Compose |

---

## Services

| Container | Role | Port |
|-----------|------|------|
| zookeeper | Kafka coordination | 2181 |
| kafka | Message streaming broker | 9092 |
| postgres | Main data warehouse | 5432 |
| airflow-postgres | Airflow metadata DB | 5433 |
| airflow-webserver | Airflow UI & REST API | 8080 |
| airflow-scheduler | DAG task orchestration | — |
| minio | S3-compatible object storage | 9010 / 9011 |
| spark-master | Spark cluster master | 8090 |
| spark-worker | Spark worker #1 | — |
| spark-worker-2 | Spark worker #2 | — |
| spark-streaming | Kafka → Parquet stream job | — |
| spark-analytics | Parquet → PostgreSQL analytics | — |
| dashboard-api | FastAPI REST backend | 8000 |
| dashboard-ui | React web frontend | 3000 |

---

## Project Structure

```
ETL-crypto_currency/
├── docker-compose.yml          # Container orchestration
├── .env                        # Environment variables
├── dags/
│   ├── crypto_producer_dag.py  # Fetch crypto prices → Kafka (every 1 min)
│   └── crypto_analytics_dag.py # Trigger Spark analytics (every 5 min)
├── spark-jobs/
│   ├── kafka_to_minio.py       # Stream: Kafka → Parquet (MinIO)
│   ├── analytics.py            # Batch: Parquet → PostgreSQL metrics
│   └── submit_analytics.sh     # Analytics trigger script
├── airflow/
│   ├── Dockerfile
│   └── requirements.txt
├── dashboard/
│   ├── api/
│   │   ├── main.py             # FastAPI endpoints
│   │   ├── requirements.txt
│   │   └── Dockerfile
│   └── ui/
│       ├── src/
│       │   ├── App.jsx
│       │   └── components/
│       │       ├── CoinGrid.jsx        # Live crypto price grid
│       │       ├── PriceChart.jsx      # Price chart with SMA/EMA
│       │       ├── TopMovers.jsx       # Top gainers & losers
│       │       ├── AlertsFeed.jsx      # Price alert feed
│       │       └── PipelineStatus.jsx  # Pipeline health monitor
│       ├── package.json
│       ├── vite.config.js
│       ├── tailwind.config.js
│       └── Dockerfile
├── postgres/
│   └── init.sql                # DB schema & table creation
├── ETL_Crypto_Agile_v1.xlsx    # Agile sprint documentation
└── logs/                       # Airflow logs
```

---

## Data Flow

### Step 1 — Ingestion (Airflow: every 1 min)
- Fetch top 20 coins from CoinGecko API (2 batches, 30s apart)
- Validate data quality (required fields, price > 0)
- Failed records → `dead_letter_queue` table
- Push to Kafka topic `crypto-prices`
- Log metrics (records pushed, latency, status) → `pipeline_metrics`

### Step 2 — Stream Processing (Spark Streaming: continuous)
- Read from Kafka topic `crypto-prices`
- Parse & flatten JSON → individual coin rows
- Write to MinIO as Parquet files (batched every 30 seconds)
- Path: `s3a://crypto-data/parquet/`

### Step 3 — Analytics (Airflow: every 5 min)
- Read latest 10-minute window from Parquet
- Calculate per-coin: SMA, EMA, volatility, 1-min & 5-min price changes
- Generate 1-minute OHLCV candles
- Identify top 5 gainers & losers
- Detect price alerts (>2% change threshold)
- Write all results to PostgreSQL

### Step 4 — API Layer (FastAPI)
- Serve analytics data via REST endpoints
- Real-time SSE stream: `/api/stream/market`
- Swagger docs: `http://localhost:8000/docs`

### Step 5 — Dashboard (React)
- Live ticker board with all coins
- Price chart with SMA & EMA overlays
- Top gainers/losers leaderboard
- Price alerts feed (PUMP/DUMP)
- Pipeline health status
- Auto-refreshes every 30 seconds

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `crypto_table` | Main metrics (price, SMA, EMA, volatility, changes) |
| `ohlcv_1min` | 1-minute candlestick data |
| `top_5_gainers` | Snapshot of top 5 gainers (5-min window) |
| `top_5_losers` | Snapshot of top 5 losers (5-min window) |
| `price_alerts` | Price alerts (>2% moves, PUMP/DUMP) |
| `pipeline_metrics` | Airflow task execution telemetry |
| `dead_letter_queue` | Failed/invalid records from producer |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | DB status & data freshness |
| GET | `/api/coins/latest` | Latest prices for all coins |
| GET | `/api/coins/{id}/history` | Historical price time series |
| GET | `/api/coins/{id}/summary` | Aggregated metrics (min/max/avg) |
| GET | `/api/coins/{id}/risk` | Risk score & volatility metrics |
| GET | `/api/gainers` | Top 5 gainers (5-min window) |
| GET | `/api/losers` | Top 5 losers (5-min window) |
| GET | `/api/ohlcv/{id}` | 1-minute OHLCV candles |
| GET | `/api/alerts` | Recent price alerts |
| GET | `/api/anomalies` | Statistical anomalies (>2σ) |
| GET | `/api/pipeline` | Pipeline task health metrics |
| GET | `/api/stream/market` | Live SSE market stream |

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Git

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Rajaaz19/ETL-crypto_currency.git
cd ETL-crypto_currency

# 2. Start all services
docker-compose up -d

# 3. Wait ~60 seconds for services to initialize
docker-compose logs -f airflow-webserver

# 4. Access the interfaces
```

| Interface | URL | Credentials |
|-----------|-----|-------------|
| React Dashboard | http://localhost:3000 | — |
| FastAPI Swagger | http://localhost:8000/docs | — |
| Airflow UI | http://localhost:8080 | admin / admin_password |
| MinIO Console | http://localhost:9011 | minioadmin / minioadmin123 |
| Spark UI | http://localhost:8090 | — |

### Trigger Data Flow Manually

```bash
# Trigger the producer DAG manually (or let it run on schedule)
docker exec airflow-webserver airflow dags trigger Crypto_Producer

# Check Kafka messages
docker exec kafka kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic crypto-prices \
  --max-messages 5

# Check PostgreSQL data
docker exec -it postgres psql -U crypto_user -d crypto_db \
  -c "SELECT COUNT(*) FROM crypto_table;"
```

### Stop the Project

```bash
# Graceful shutdown
docker-compose down

# Reset all data (WARNING: deletes all volumes)
docker-compose down -v
```

---

## Monitoring & Debugging

```bash
# View logs per service
docker-compose logs -f airflow-scheduler
docker-compose logs -f spark-streaming
docker-compose logs -f spark-analytics
docker-compose logs -f dashboard-api

# Check pipeline metrics in PostgreSQL
docker exec -it postgres psql -U crypto_user -d crypto_db \
  -c "SELECT * FROM pipeline_metrics ORDER BY created_at DESC LIMIT 10;"

# Check dead letter queue
docker exec -it postgres psql -U crypto_user -d crypto_db \
  -c "SELECT * FROM dead_letter_queue ORDER BY created_at DESC LIMIT 10;"

# List MinIO Parquet files
docker exec minio mc ls local/crypto-data/parquet/
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| DAGs not showing in Airflow | Check `docker-compose logs airflow-webserver` for import errors |
| No data in PostgreSQL | Check spark-streaming logs; verify MinIO credentials in `.env` |
| Dashboard shows no data | Trigger `Crypto_Producer` DAG manually, wait 5 min for analytics |
| 502 errors on frontend | Check `docker-compose logs dashboard-api` |
| Kafka topic issues | Verify `KAFKA_AUTO_CREATE_TOPICS_ENABLE=true` in docker-compose |
| MinIO auth fails | Verify `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` in `.env` |

---

## Agile Documentation

Sprint planning, backlog, retrospectives, and impediments log are maintained in [`ETL_Crypto_Agile_v1.xlsx`](ETL_Crypto_Agile_v1.xlsx).

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | ETL concepts & project workflow | Completed |
| Sprint 2 | Dataset creation & ETL implementation | Completed |
| Sprint 3 | Kafka setup & streaming | Completed |
| Sprint 4 | Spark processing & transformations | Completed |
| Sprint 5 | Airflow DAG creation & scheduling | Completed |
| Sprint 6 | Flask/FastAPI & frontend dashboard | Completed |
| Sprint 7 | Analytics page, charts & search/filter | Completed |
| Sprint 8 | Email alerts, testing & deployment | In Progress |

---

## Author

**Paul Rajasekar B**  
ETL & Data Engineering Internship Project
