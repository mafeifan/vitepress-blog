#!/bin/bash

echo "检查图片链接可访问性..."
echo "================================"

grep -rh '!\[.*\](' docs/DevOps/Docker | grep -o 'https\?://[^)]*' | sort -u | while read url; do
    status=$(curl -o /dev/null -s -w "%{http_code}" --max-time 5 "$url")
    if [ "$status" = "200" ]; then
        echo "✓ $url"
    else
        echo "✗ [$status] $url"
    fi
done
