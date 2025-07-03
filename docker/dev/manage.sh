#!/bin/bash
# Development environment management script

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../.." && pwd )"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_usage() {
    echo "Usage: $0 {start|stop|restart|status|logs|update-db|generate|shell|clean}"
    echo ""
    echo "Commands:"
    echo "  start       - Start all services"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  status      - Show service status"
    echo "  logs        - Show logs (optional: service name)"
    echo "  update-db   - Rebuild and publish SpacetimeDB module"
    echo "  generate    - Generate TypeScript bindings"
    echo "  shell       - Open shell in service (requires service name)"
    echo "  clean       - Stop and remove all containers and volumes"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}Error: Docker is not installed${NC}"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null; then
        echo -e "${RED}Error: Docker Compose is not installed${NC}"
        exit 1
    fi
}

start_services() {
    echo -e "${GREEN}Starting development environment...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" up -d
    
    echo -e "${YELLOW}Waiting for services to be ready...${NC}"
    sleep 10
    
    docker-compose -f "$COMPOSE_FILE" ps
    
    echo -e "${GREEN}Development environment started!${NC}"
    echo ""
    echo "Service URLs:"
    echo "  - Client: http://localhost:5173"
    echo "  - SpacetimeDB: ws://localhost:3000/kanban-plus"
    echo "  - Chrome DevTools: http://localhost:9222"
}

stop_services() {
    echo -e "${YELLOW}Stopping development environment...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" down
    echo -e "${GREEN}Services stopped${NC}"
}

restart_services() {
    stop_services
    start_services
}

show_status() {
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" ps
}

show_logs() {
    cd "$PROJECT_ROOT"
    if [ -n "$2" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$2"
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

update_database() {
    echo -e "${YELLOW}Updating SpacetimeDB module...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" exec spacetimedb \
        spacetime publish --project-path /workspace/server kanban-plus
    echo -e "${GREEN}Database module updated${NC}"
}

generate_bindings() {
    echo -e "${YELLOW}Generating TypeScript bindings...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" exec client \
        npm run db:generate
    echo -e "${GREEN}Bindings generated${NC}"
}

open_shell() {
    if [ -z "$2" ]; then
        echo -e "${RED}Error: Please specify a service name${NC}"
        echo "Available services: spacetimedb, client, puppeteer"
        exit 1
    fi
    
    cd "$PROJECT_ROOT"
    docker-compose -f "$COMPOSE_FILE" exec "$2" /bin/bash
}

clean_all() {
    echo -e "${RED}This will remove all containers and volumes!${NC}"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$PROJECT_ROOT"
        docker-compose -f "$COMPOSE_FILE" down -v
        echo -e "${GREEN}Cleanup complete${NC}"
    else
        echo "Cleanup cancelled"
    fi
}

# Main script
check_docker

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    update-db)
        update_database
        ;;
    generate)
        generate_bindings
        ;;
    shell)
        open_shell "$@"
        ;;
    clean)
        clean_all
        ;;
    *)
        print_usage
        exit 1
        ;;
esac