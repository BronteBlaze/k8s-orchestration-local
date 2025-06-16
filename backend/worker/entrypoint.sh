#!/bin/bash

echo "Waiting for RabbitMQ..."
until nc -z rabbitmq 5672; do sleep 1; done
echo "RabbitMQ is up."

echo "Waiting for Postgres..."
until nc -z postgres 5432; do sleep 1; done
echo "Postgres is up."

exec node worker.js
