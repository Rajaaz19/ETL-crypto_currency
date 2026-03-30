#!/bin/bash
# Signals the spark-analytics container to run analytics.py.
# Called by the crypto_analytics Airflow DAG every 5 minutes.
TRIGGER="/opt/spark-jobs/.analytics_trigger"
touch "$TRIGGER"
echo "Trigger file created: $TRIGGER"
echo "spark-analytics container will pick it up within 10 seconds."