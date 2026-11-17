#!/bin/bash

docker exec -i nestjs-order-saga-postgres-1 psql -U saga -d saga_db_order <<EOF

TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE saga CASCADE;
TRUNCATE TABLE outbox_message;
EOF

# payment

docker exec -i nestjs-order-saga-postgres-1 psql -U saga -d saga_db_payment <<EOF

TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE outbox_message;
EOF

# Inventory

docker exec -i nestjs-order-saga-postgres-1 psql -U saga -d saga_db_inventory <<EOF

TRUNCATE TABLE product_reservation CASCADE;
UPDATE product SET "reservedQuantity" = 0;
TRUNCATE TABLE outbox_message;
EOF