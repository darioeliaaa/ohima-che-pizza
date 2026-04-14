#!/bin/bash
# Script per esporre il progetto online tramite ngrok
# Uso: ./esponi.sh

cd "$(dirname "$0")"

GREEN='\033[1;32m'
YELLOW='\033[1;33m'
CYAN='\033[1;36m'
RED='\033[1;31m'
NC='\033[0m'

cleanup() {
    echo ""
    echo "Chiudo tutto..."
    kill $PID_BACKEND $PID_NGROK 2>/dev/null
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    exit 0
}
trap cleanup INT TERM

# Carica variabili d'ambiente
set -a && source .env && set +a

# Killa processi vecchi sulla porta
lsof -ti:8080 | xargs kill -9 2>/dev/null
sleep 1

# ── 1. Build del frontend (produzione) ──
echo -e "${CYAN}=== Build frontend di produzione ===${NC}"
npm run build --prefix frontend
if [ $? -ne 0 ]; then
    echo -e "${RED}Errore nella build del frontend!${NC}"
    exit 1
fi

# Copia i file buildati nelle risorse statiche di Spring Boot
rm -rf src/main/resources/static
cp -r frontend/dist src/main/resources/static
echo -e "${GREEN}Frontend buildato e copiato in resources/static${NC}"

# ── 2. Avvio Backend (serve sia API che frontend) ──
echo -e "${CYAN}=== Avvio Backend con profilo prod (porta 8080) ===${NC}"
SPRING_PROFILES_ACTIVE=prod ./mvnw spring-boot:run -q 2>/dev/null &
PID_BACKEND=$!

# Aspetta che il backend sia pronto
echo -e "${YELLOW}Attendo che il backend sia pronto...${NC}"
for i in $(seq 1 60); do
    if curl -s http://localhost:8080/api/restaurants > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# ── 3. Avvio ngrok (espone la porta 8080) ──
echo -e "${CYAN}=== Avvio ngrok ===${NC}"
ngrok http 8080 --log=stderr > /dev/null 2>&1 &
PID_NGROK=$!

# Aspetta che ngrok sia pronto e recupera l'URL
echo -e "${YELLOW}Attendo URL pubblico...${NC}"
NGROK_URL=""
for i in $(seq 1 15); do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['tunnels'][0]['public_url'])" 2>/dev/null)
    if [ -n "$NGROK_URL" ]; then
        break
    fi
    sleep 1
done

# Aggiorna CORS con l'URL ngrok
if [ -n "$NGROK_URL" ]; then
    echo -e "${YELLOW}Aggiorno CORS per $NGROK_URL...${NC}"
    export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:8080,$NGROK_URL,${NGROK_URL/http:/https:}"
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  SITO ONLINE!${NC}"
echo -e "${GREEN}  Manda questo link:${NC}"
echo ""
echo -e "${GREEN}  ${NGROK_URL}${NC}"
echo ""
echo -e "${GREEN}============================================${NC}"
echo ""
echo -e "${YELLOW}  Premi Ctrl+C per chiudere tutto${NC}"
echo ""

wait
