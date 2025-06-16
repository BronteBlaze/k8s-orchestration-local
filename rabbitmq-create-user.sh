#!/bin/bash

# docker compose exec rabbitmq rabbitmqctl add_user bijay bijay123
# docker compose exec rabbitmq rabbitmqctl set_user_tags bijay administrator
# docker compose exec rabbitmq rabbitmqctl set_permissions -p / bijay ".*" ".*" ".*"

rabbitmqctl add_user bijay bijay123
rabbitmqctl set_user_tags bijay administrator
rabbitmqctl set_permissions -p / bijay ".*" ".*" ".*"