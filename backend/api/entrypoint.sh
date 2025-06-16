#!/bin/bash

# Wait for RabbitMQ and Redis
echo "Waiting for RabbitMQ..."
until nc -z rabbitmq 5672; do sleep 1; done
echo "RabbitMQ is up."

echo "Waiting for Redis..."
until nc -z redis 6379; do sleep 1; done
echo "Redis is up."

exec node index.js
