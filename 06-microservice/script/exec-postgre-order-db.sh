#!/bin/bash

docker exec -it nestjs-order-saga-postgres-1 psql -U saga -d saga_db_order