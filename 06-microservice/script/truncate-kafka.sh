#!/bin/bash

docker compose exec -i kafka bash << 'EOF'
for topic in $(/opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --list | grep -v "__consumer_offsets"); do
  /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 --delete --topic "$topic"
done
EOF

echo "Đã xóa sạch các Kafka topic thành công!"