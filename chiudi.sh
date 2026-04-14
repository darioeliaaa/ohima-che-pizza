#!/bin/bash
# Script per chiudere tutto (backend, frontend, ngrok)

RED='\033[1;31m'
GREEN='\033[1;32m'
NC='\033[0m'

echo -e "${RED}=== Chiudo tutto ===${NC}"

# Killa ngrok
pkill -f "ngrok" 2>/dev/null && echo "  ngrok chiuso" || echo "  ngrok non era attivo"

# Killa frontend (Vite/node)
lsof -ti:5173 | xargs kill -9 2>/dev/null && echo "  Frontend chiuso (porta 5173)" || echo "  Frontend non era attivo"

# Killa backend (Spring Boot/Java)
lsof -ti:8080 | xargs kill -9 2>/dev/null && echo "  Backend chiuso (porta 8080)" || echo "  Backend non era attivo"

# Killa anche la dashboard ngrok
lsof -ti:4040 | xargs kill -9 2>/dev/null

echo ""
echo -e "${GREEN}Tutto chiuso!${NC}"
