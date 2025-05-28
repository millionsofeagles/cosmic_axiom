#!/bin/bash

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[0;37m'
BOLD='\033[1m'
RESET='\033[0m'

# Service definitions with colors and ports
declare -A SERVICE_COLORS=(
    ["astral"]="$CYAN"
    ["forge"]="$GREEN"
    ["library"]="$YELLOW"
    ["singularity"]="$MAGENTA"
    ["satellite"]="$BLUE"
    ["horizon"]="$RED"
    ["nebula"]="$WHITE"
    ["frontend"]="$BOLD$GREEN"
)

declare -A SERVICE_PORTS=(
    ["astral"]="3001"
    ["forge"]="3002"
    ["library"]="3003"
    ["singularity"]="3004"
    ["satellite"]="3005"
    ["horizon"]="3006"
    ["nebula"]="3007"
    ["frontend"]="5173"
)

# Array to store PIDs
declare -A SERVICE_PIDS

# Function to print colored service name
print_service() {
    local service=$1
    local message=$2
    echo -e "${SERVICE_COLORS[$service]}[$service]${RESET} $message"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -Pi :$port -sTCP:LISTEN -t 2>/dev/null)
    if [ ! -z "$pid" ]; then
        kill -9 $pid 2>/dev/null
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${BOLD}${RED}Shutting down all services...${RESET}"
    
    # Kill all services
    for service in "${!SERVICE_PIDS[@]}"; do
        if [ ! -z "${SERVICE_PIDS[$service]}" ]; then
            print_service "$service" "Stopping (PID: ${SERVICE_PIDS[$service]})"
            kill "${SERVICE_PIDS[$service]}" 2>/dev/null
            
            # Also kill any processes on the service port
            kill_port "${SERVICE_PORTS[$service]}"
        fi
    done
    
    # Give processes time to terminate
    sleep 2
    
    # Force kill any remaining processes
    for service in "${!SERVICE_PIDS[@]}"; do
        if [ ! -z "${SERVICE_PIDS[$service]}" ] && kill -0 "${SERVICE_PIDS[$service]}" 2>/dev/null; then
            kill -9 "${SERVICE_PIDS[$service]}" 2>/dev/null
        fi
    done
    
    echo -e "${BOLD}${GREEN}All services stopped.${RESET}"
    exit 0
}

# Set up trap for clean exit
trap cleanup EXIT INT TERM

# Clear screen
clear

# Print header
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║               COSMIC AXIOM - Service Manager               ║${RESET}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Check if MySQL is running
echo -e "${BOLD}Checking MySQL...${RESET}"
if ! docker ps | grep -q mysql-cosmic-axiom; then
    echo -e "${RED}ERROR: MySQL container is not running!${RESET}"
    echo -e "${YELLOW}Please run './infra/standup.sh' first to set up the database.${RESET}"
    exit 1
fi
echo -e "${GREEN}✓ MySQL is running${RESET}"
echo ""

# Check for .env files
echo -e "${BOLD}Checking environment configuration...${RESET}"
MISSING_ENV=false

# Check backend services
BACKEND_SERVICES=("astral" "forge" "library" "singularity" "satellite" "horizon" "nebula")
for service in "${BACKEND_SERVICES[@]}"; do
    if [ ! -f "services/$service/.env" ]; then
        echo -e "${RED}✗${RESET} Missing .env file for ${BOLD}$service${RESET}"
        MISSING_ENV=true
    else
        # Check for placeholder values that need to be updated
        if [ "$service" = "nebula" ]; then
            if grep -q "your_claude_api_key_here" "services/$service/.env"; then
                echo -e "${YELLOW}⚠${RESET} ${BOLD}$service${RESET} .env contains placeholder API key"
            fi
        fi
    fi
done

# Check frontend
if [ ! -f "frontend/.env" ]; then
    echo -e "${RED}✗${RESET} Missing .env file for ${BOLD}frontend${RESET}"
    MISSING_ENV=true
fi

if [ "$MISSING_ENV" = true ]; then
    echo -e "${RED}ERROR: Missing .env files detected!${RESET}"
    echo -e "${YELLOW}Please run './infra/standup.sh' first to set up environment files.${RESET}"
    exit 1
fi

echo -e "${GREEN}✓ Environment configuration complete${RESET}"
echo ""

# Kill any existing processes on our ports
echo -e "${BOLD}Checking for existing processes...${RESET}"
for service in "${!SERVICE_PORTS[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    if check_port $port; then
        echo -e "${YELLOW}Port $port is in use, killing existing process...${RESET}"
        kill_port $port
        sleep 1
    fi
done
echo ""

# Start backend services
echo -e "${BOLD}Starting backend services...${RESET}"
BACKEND_SERVICES=("astral" "forge" "library" "singularity" "satellite" "horizon" "nebula")

for service in "${BACKEND_SERVICES[@]}"; do
    print_service "$service" "Starting on port ${SERVICE_PORTS[$service]}..."
    
    # Navigate to service directory
    cd "services/$service" 2>/dev/null
    if [ $? -ne 0 ]; then
        print_service "$service" "${RED}ERROR: Service directory not found${RESET}"
        continue
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_service "$service" "${YELLOW}Installing dependencies...${RESET}"
        npm install > /dev/null 2>&1
    fi
    
    # Start the service with colored output
    (
        npm run dev 2>&1 | while IFS= read -r line; do
            echo -e "${SERVICE_COLORS[$service]}[$service]${RESET} $line"
        done
    ) &
    
    SERVICE_PIDS[$service]=$!
    cd - > /dev/null
    
    # Give service time to start
    sleep 2
done

echo ""
echo -e "${BOLD}Starting frontend...${RESET}"

# Start frontend
cd frontend 2>/dev/null
if [ $? -eq 0 ]; then
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_service "frontend" "${YELLOW}Installing dependencies...${RESET}"
        npm install > /dev/null 2>&1
    fi
    
    print_service "frontend" "Starting on port ${SERVICE_PORTS[frontend]}..."
    (
        npm run dev 2>&1 | while IFS= read -r line; do
            echo -e "${SERVICE_COLORS[frontend]}[frontend]${RESET} $line"
        done
    ) &
    SERVICE_PIDS[frontend]=$!
    cd - > /dev/null
else
    print_service "frontend" "${RED}ERROR: Frontend directory not found${RESET}"
fi

# Wait a moment for services to initialize
sleep 5

# Print status
echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║                    Service Status                          ║${RESET}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════╝${RESET}"
echo ""

for service in "${!SERVICE_PORTS[@]}"; do
    port="${SERVICE_PORTS[$service]}"
    if check_port $port; then
        echo -e "${SERVICE_COLORS[$service]}● $service${RESET} - ${GREEN}Running${RESET} on port $port"
    else
        echo -e "${SERVICE_COLORS[$service]}● $service${RESET} - ${RED}Failed${RESET} on port $port"
    fi
done

echo ""
echo -e "${BOLD}${GREEN}All services started!${RESET}"
echo ""
echo -e "${BOLD}Access the application at:${RESET} ${CYAN}http://localhost:5173${RESET}"
echo -e "${BOLD}Default credentials:${RESET}"
echo -e "  Admin: ${YELLOW}admin@cosmic.com${RESET} / ${YELLOW}admin123${RESET}"
echo -e "  User:  ${YELLOW}user@cosmic.com${RESET} / ${YELLOW}user123${RESET}"
echo ""
echo -e "${BOLD}Press ${RED}Ctrl+C${RESET} to stop all services${RESET}"
echo ""

# Keep script running and show logs
wait