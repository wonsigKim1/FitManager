#!/bin/bash
echo "==================================================="
echo "  FitManager Web App Server Starting..."
echo "==================================================="
echo ""
echo "Opening browser at http://localhost:8080"
python3 -m http.server 8080 &
sleep 1
if which open > /dev/null; then
    open "http://localhost:8080"
elif which xdg-open > /dev/null; then
    xdg-open "http://localhost:8080"
fi
wait
