#!/bin/bash
echo "=== DEBUG RAILWAY ==="
/app/debug-railway.sh
exec node dist/apps/apis-monorepo/main.js 