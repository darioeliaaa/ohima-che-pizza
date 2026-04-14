#!/bin/zsh
# ============================================
#  Avvia Centro Estetico
#  Backend (Spring Boot) + Frontend (Vite)
# ============================================

cd "$(dirname "$0")" || exit 1
ROOT="$PWD"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo "${CYAN}╔══════════════════════════════════════════╗${NC}"
echo "${CYAN}║   ✨  Centro Estetico - Avvio            ║${NC}"
echo "${CYAN}╚══════════════════════════════════════════╝${NC}"
echo ""

# ---------- Carica variabili d'ambiente ----------
if [[ -f "$ROOT/.env" ]]; then
  set -a
  source "$ROOT/.env"
  set +a
  echo "${GREEN}✓ Variabili d'ambiente caricate da .env${NC}"
else
  echo "${YELLOW}⚠ File .env non trovato — assicurati che le variabili DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET siano impostate${NC}"
fi

# ---------- Funzione cleanup ----------
cleanup() {
  echo ""
  echo "${YELLOW}Arresto in corso...${NC}"
  [[ -n "$BACKEND_PID" ]] && kill "$BACKEND_PID" 2>/dev/null && echo "${GREEN}✓ Backend fermato${NC}"
  [[ -n "$FRONTEND_PID" ]] && kill "$FRONTEND_PID" 2>/dev/null && echo "${GREEN}✓ Frontend fermato${NC}"
  # Cleanup figli rimasti
  lsof -ti:8080 2>/dev/null | xargs kill -9 2>/dev/null
  lsof -ti:5173 2>/dev/null | xargs kill -9 2>/dev/null
  echo "${GREEN}Tutto spento. Ciao!${NC}"
  exit 0
}
trap cleanup INT TERM

# ---------- Controlla Java ----------
echo "${CYAN}[1/5] Controllo Java...${NC}"
if ! command -v java &>/dev/null; then
  echo "${RED}✗ Java non trovato! Installa Java 21.${NC}"
  exit 1
fi
JAVA_VER=$(java -version 2>&1 | head -1)
echo "${GREEN}✓ $JAVA_VER${NC}"

# ---------- Controlla Node ----------
echo "${CYAN}[2/5] Controllo Node.js...${NC}"
if ! command -v node &>/dev/null; then
  echo "${RED}✗ Node.js non trovato! Installa Node 18+.${NC}"
  exit 1
fi
echo "${GREEN}✓ Node $(node -v)${NC}"

# ---------- Libera porte occupate ----------
echo "${CYAN}[3/5] Libero porte 8080 e 5173...${NC}"
if lsof -ti:8080 &>/dev/null; then
  lsof -ti:8080 | xargs kill -9 2>/dev/null
  sleep 1
  echo "${YELLOW}  ↳ Porta 8080 liberata${NC}"
else
  echo "${GREEN}  ↳ Porta 8080 libera${NC}"
fi
if lsof -ti:5173 &>/dev/null; then
  lsof -ti:5173 | xargs kill -9 2>/dev/null
  sleep 1
  echo "${YELLOW}  ↳ Porta 5173 liberata${NC}"
else
  echo "${GREEN}  ↳ Porta 5173 libera${NC}"
fi

# ---------- Avvia Backend ----------
echo "${CYAN}[4/5] Avvio Backend (Spring Boot)...${NC}"
cd "$ROOT"
./mvnw spring-boot:run -q > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Aspetta che il backend sia pronto (max 120 secondi)
echo -n "  Attendo avvio backend"
TRIES=0
MAX_TRIES=60
while [[ $TRIES -lt $MAX_TRIES ]]; do
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080/api/restaurants" 2>/dev/null | grep -q "200"; then
    break
  fi
  # Controlla se il processo è morto
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo ""
    echo "${RED}✗ Backend crashato! Ultimi errori:${NC}"
    tail -20 /tmp/backend.log
    exit 1
  fi
  echo -n "."
  sleep 2
  TRIES=$((TRIES + 1))
done
echo ""

if [[ $TRIES -ge $MAX_TRIES ]]; then
  echo "${RED}✗ Backend non risponde dopo 120s. Log:${NC}"
  tail -20 /tmp/backend.log
  kill "$BACKEND_PID" 2>/dev/null
  exit 1
fi
echo "${GREEN}✓ Backend attivo su http://localhost:8080${NC}"

# ---------- Avvia Frontend ----------
echo "${CYAN}[5/5] Avvio Frontend (Vite)...${NC}"
cd "$ROOT/frontend"

# Installa dipendenze se manca node_modules
if [[ ! -d "node_modules" ]]; then
  echo "${YELLOW}  ↳ Primo avvio: installo dipendenze npm...${NC}"
  npm install --silent 2>&1
fi

npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Aspetta che il frontend sia pronto
sleep 3
echo -n "  Attendo avvio frontend"
TRIES=0
MAX_TRIES=15
while [[ $TRIES -lt $MAX_TRIES ]]; do
  if curl -s -o /dev/null "http://localhost:5173" 2>/dev/null; then
    break
  fi
  echo -n "."
  sleep 2
  TRIES=$((TRIES + 1))
done
echo ""

if [[ $TRIES -ge $MAX_TRIES ]]; then
  echo "${RED}✗ Frontend non risponde. Log:${NC}"
  tail -10 /tmp/frontend.log
  kill "$BACKEND_PID" 2>/dev/null
  exit 1
fi
echo "${GREEN}✓ Frontend attivo su http://localhost:5173${NC}"

# ---------- Apri browser ----------
echo ""
echo "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo "${GREEN}║   ✓ Tutto pronto!                       ║${NC}"
echo "${GREEN}║                                         ║${NC}"
echo "${GREEN}║   Sito:  http://localhost:5173           ║${NC}"
echo "${GREEN}║   Admin: http://localhost:5173/admin/login║${NC}"
echo "${GREEN}║                                         ║${NC}"
echo "${GREEN}║   Premi Ctrl+C per fermare tutto         ║${NC}"
echo "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""

open "http://localhost:5173"

# ---------- Resta in attesa ----------
wait
